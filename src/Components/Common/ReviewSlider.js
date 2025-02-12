import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import axiosWithToken from '../../pages/ApiCalls/axiosWithToken';
import { Card, CardBody } from 'reactstrap';
import "swiper/css";
import "swiper/css/pagination";
import Rating from 'react-rating';
import DefaultProfile from "../../assets/person.png";
// import required modules
import { Autoplay, Mousewheel } from "swiper/modules";

const ReviewSlider = ({ reviews }) => {
  const UrlBase='http://localhost:3000';
  const [studentData, setStudentData] = useState({});
  const [viewMore, setViewMore] = useState(false);

  useEffect(() => {
    const fetchStudentData = async (id) => {
      try {
        const response = await axiosWithToken.get(`/student/student/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching student data:", error);
        return { name: "Unknown", profilePicture: null };
      }
    };

    const loadStudentData = async () => {
      const data = {};
      for (const review of reviews) {
        if (!data[review.studentId]) {
          data[review.studentId] = await fetchStudentData(review.studentId);
        }
      }
      setStudentData(data);
    };

    loadStudentData();
  }, [reviews]);

  return (
    <div>
      <Swiper
        direction={"vertical"}
        slidesPerView={viewMore ? 6 : 2}
        spaceBetween={10}
        mousewheel={true}
        loop={true}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay, Mousewheel]}
        className="mySwiper vertical-swiper"
        style={{ height: viewMore ? "750px" : "250px" }}
      >
        {reviews.map((review) => {
          const student = studentData[review.studentId] || {};
          return (
            <SwiperSlide key={review.id}>
              <Card className="border border-dashed shadow-none">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-shrink-0 avatar-sm">
                      <div className="avatar-title bg-light rounded">
                        <img
                          src={student.profilePicture ? UrlBase+ student.profilePicture : DefaultProfile}
                          alt={student.name ? student.name : "Default Profile"}
                          height="30"
                        />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div>
                        <p className="text-muted mb-1 fst-italic text-truncate-two-lines">
                          {review.comment}
                        </p>
                        <div className="fs-11 align-middle text-warning">
                          {[...Array(review.rating)].map((_, i) => (
                            <i key={i} className="ri-star-fill"></i>
                          ))}
                        </div>
                      </div>
                      <div className="text-end mb-0 text-muted">
                        - by <cite title="Source Title">{student.name}</cite>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div className="text-center mt-3">
        <span
          style={{ color: "lightblue", cursor: "pointer" }}
          onClick={() => setViewMore(!viewMore)}
        >
          {viewMore ? "View Less" : "View More"}
        </span>
      </div>
    </div>
  );
};

export default ReviewSlider;