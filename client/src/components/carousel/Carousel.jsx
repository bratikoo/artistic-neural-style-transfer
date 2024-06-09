import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Carousel.css";
import photo1 from "../../assets/1.jpg";
import photo2 from "../../assets/2.jpg";
import photo3 from "../../assets/3.jpg";
import photo4 from "../../assets/4.jpg";

const photos = [
  {
    id: 1,
    url: photo1,
  },
  {
    id: 2,
    url: photo2,
  },
  {
    id: 3,
    url: photo3,
  },
  {
    id: 4,
    url: photo4,
  },
];

export const Carousel = ({ imgStyleRef }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    className: "center",
  };

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        {photos.map((photo) => (
          <div key={photo.id} className="carousel-slide">
            <img
              ref={imgStyleRef}
              src={photo.url}
              alt={`Photo ${photo.id}`}
              className="carousel-photo"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};
