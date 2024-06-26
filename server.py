from flask import Flask, request, send_file, jsonify
from PIL import Image
import matplotlib.pyplot as plt
import numpy as np
import io
import torch
import torch.optim as optim
from flask_cors import CORS
from torchvision import transforms, models

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the VGG19 model
vgg = models.vgg19(pretrained=True).features

# Freeze all VGG parameters
for param in vgg.parameters():
    param.requires_grad_(False)

# Move the model to GPU, if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
vgg.to(device)

# Image preprocessing and loading function
def load_image(img_bytes, max_size=400, shape=None):
    image = Image.open(io.BytesIO(img_bytes)).convert('RGB')

    if max(image.size) > max_size:
        size = max_size
    else:
        size = max(image.size)

    if shape is not None:
        size = shape

    in_transform = transforms.Compose([
                        transforms.Resize(size),
                        transforms.ToTensor(),
                        transforms.Normalize((0.485, 0.456, 0.406),
                                             (0.229, 0.224, 0.225))])

    image = in_transform(image)[:3,:,:].unsqueeze(0)
    return image

# Helper function to convert tensor to image
def im_convert(tensor):
    image = tensor.to("cpu").clone().detach()
    image = image.numpy().squeeze()
    image = image.transpose(1, 2, 0)
    image = image * np.array((0.229, 0.224, 0.225)) + np.array((0.485, 0.456, 0.406))
    image = image.clip(0, 1)
    return image

# Function to get features from the model
def get_features(image, model, layers=None):
    if layers is None:
        layers = {'0': 'conv1_1',
                  '5': 'conv2_1',
                  '10': 'conv3_1',
                  '19': 'conv4_1',
                  '21': 'conv4_2',
                  '28': 'conv5_1'}

    features = {}
    x = image
    for name, layer in model._modules.items():
        x = layer(x)
        if name in layers:
            features[layers[name]] = x
    return features

# Function to calculate the Gram matrix
def gram_matrix(tensor):
    _, d, h, w = tensor.size()
    tensor = tensor.view(d, h * w)
    gram = torch.mm(tensor, tensor.t())
    return gram

@app.route('/stylize', methods=['POST'])
def stylize():
    if 'content' not in request.files or 'style' not in request.files:
        return jsonify({"error": "Please upload both content and style images"}), 400
    print('stylize')
    content_img = request.files['content'].read()
    style_img = request.files['style'].read()

    content = load_image(content_img).to(device)
    style = load_image(style_img, shape=content.shape[-2:]).to(device)

    content_features = get_features(content, vgg)
    style_features = get_features(style, vgg)
    style_grams = {layer: gram_matrix(style_features[layer]) for layer in style_features}

    target = content.clone().requires_grad_(True).to(device)

    style_weights = {'conv1_1': 1.,
                     'conv2_1': 0.75,
                     'conv3_1': 0.2,
                     'conv4_1': 0.2,
                     'conv5_1': 0.2}

    content_weight = 1.4  # alpha
    style_weight = 1e9  # beta

    optimizer = optim.Adam([target], lr=0.01)
    steps = 100

    for ii in range(1, steps + 1):
        target_features = get_features(target, vgg)
        content_loss = torch.mean((target_features['conv4_2'] - content_features['conv4_2'])**2)

        style_loss = 0
        for layer in style_weights:
            target_feature = target_features[layer]
            target_gram = gram_matrix(target_feature)
            _, d, h, w = target_feature.shape
            style_gram = style_grams[layer]
            layer_style_loss = style_weights[layer] * torch.mean((target_gram - style_gram)**2)
            style_loss += layer_style_loss / (d * h * w)

        total_loss = content_weight * content_loss + style_weight * style_loss

        optimizer.zero_grad()
        total_loss.backward()
        optimizer.step()

        if ii % 50 == 0:
            print(f'Step {ii}/{steps}, Total loss: {total_loss.item()}')

    final_img = im_convert(target)
    final_img = Image.fromarray((final_img * 255).astype(np.uint8))

    img_io = io.BytesIO()
    final_img.save(img_io, 'JPEG')
    img_io.seek(0)

    return send_file(img_io, mimetype='image/jpeg')

if __name__ == '__main__':
    print("Starting server...")
    app.run(debug=True)
