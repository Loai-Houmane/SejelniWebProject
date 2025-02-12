import React, { useEffect, useState, useMemo } from "react";
import {
  CardBody,
  Container,
  Progress,
  Row,
  Card,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Table,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import ReviewSlider from "../../../../Components/Common/ReviewSlider";
import { Link } from "react-router-dom";
import axiosWithToken from '../../../ApiCalls/axiosWithToken';
import Rating from 'react-rating';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EcommerceSellerDetail = ({ reviewId }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [canReview, setCanReview] = useState(false);

  const getReviewsById = async (id) => {
    try {
      const response = await axiosWithToken.get(`/agencies/reviews/${id}`);
      const reviews = response.data;
      return reviews;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  };

  const checkCanReview = async () => {
    try {
      const response = await axiosWithToken.post("/student/can-review", { agencyId: parseInt(reviewId, 10) });
      setCanReview(response.data.canReview);
    } catch (error) {
      console.error("Error checking review permission:", error);
    }
  };
  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosWithToken.post("/student/send-review", {
        agencyId: parseInt(reviewId, 10),
        rating: parseFloat(newRating),
        comment: String(newComment),
      });
      console.log("Response Status:", response.status);

      if (response.status === 201) {
        const updatedReviews = [...reviews, response.data];
        setReviews(updatedReviews);

        setRatingCounts((prevCounts) => ({
          ...prevCounts,
          [newRating]: (prevCounts[newRating] || 0) + 1,
        }));

        const totalRating = updatedReviews.reduce((acc, review) => acc + review.rating, 0);
        const avgRating = updatedReviews.length ? (totalRating / updatedReviews.length).toFixed(1) : 0;
        setAverageRating(avgRating);

        setNewRating(0);
        setNewComment("");
        setCanReview(false); // Set canReview to false on success
        toast.success("Review added successfully!", {
          closeOnClick: true,
          position: "top-right",
          autoClose: 1000 // time in milliseconds (1000ms = 1 second)
        });
      }
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error("Failed to add review. Please try again later.", { position: "top-right" });
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      const result = await getReviewsById(reviewId);
      setReviews(result);

      const totalRating = result.reduce((acc, review) => acc + review.rating, 0);
      const avgRating = result.length ? (totalRating / result.length).toFixed(1) : 0;
      setAverageRating(avgRating);

      const counts = result.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      setRatingCounts(counts);
    };

    fetchReviews();
    checkCanReview();
  }, [reviewId]);

  return (
    <Card>
      <ToastContainer />
      <CardBody className="border-top border-top-dashed p-4">
        <div>
          <h6 className="text-muted text-uppercase fw-semibold mb-4">
            Customer Reviews
          </h6>
          <div>
            <div>
              <div className="bg-light px-3 py-2 rounded-2 mb-2">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="fs-16 align-middle text-warning">
                      <Rating
                        initialRating={averageRating}
                        readonly
                        emptySymbol={<i className="ri-star-line"></i>}
                        fullSymbol={<i className="ri-star-fill"></i>}
                        halfSymbol={<i className="ri-star-half-fill"></i>}
                      />
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <h6 className="mb-0">{averageRating} out of 5</h6>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted">
                  Total <span className="fw-medium">{reviews.length}</span> reviews
                </div>
              </div>
            </div>

            <div className="mt-3">
              {[5, 4, 3, 2, 1].map((star) => {
                const getColor = (star) => {
                  const green = Math.floor((star / 5) * 255);
                  const red = 255 - green;
                  return `rgb(${red}, ${green}, 0)`;
                };

                return (
                  <Row className="align-items-center g-2" key={star}>
                    <div className="col-auto">
                      <div className="p-1">
                        <h6 className="mb-0">{star} star</h6>
                      </div>
                    </div>
                    <div className="col">
                      <div className="p-1">
                        <div className="progress animated-progess progress-sm">
                          <Progress
                            bar
                            style={{ backgroundColor: getColor(star) }}
                            value={(ratingCounts[star] / reviews.length) * 100}
                          ></Progress>
                        </div>
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="p-1">
                        <h6 className="mb-0 text-muted">{ratingCounts[star]}</h6>
                      </div>
                    </div>
                  </Row>
                );
              })}
            </div>
          </div>
        </div>
      </CardBody>
      <CardBody className="p-4 border-top border-top-dashed">
        <h6 className="text-muted text-uppercase fw-semibold mb-4">
          Reviews
        </h6>

        {Array.isArray(reviews) && reviews.length > 0 ? (
          <ReviewSlider reviews={reviews} />
        ) : (
          <div>No reviews available.</div>
        )}

        {canReview && (
          <>
            <h6 className="text-muted text-uppercase fw-semibold mb-4 mt-4">
              Add a Review
            </h6>
            <Form onSubmit={handleAddReview}>
              <FormGroup>
                <Label for="rating">Rating</Label>
                <Rating
                  id="rating"
                  initialRating={newRating}
                  onChange={(rate) => setNewRating(rate)}
                  emptySymbol={<i className="ri-star-line"></i>}
                  fullSymbol={<i className="ri-star-fill"></i>}
                  halfSymbol={<i className="ri-star-half-fill"></i>}
                />
              </FormGroup>
              <FormGroup>
                <Label for="comment">Comment</Label>
                <Input
                  type="textarea"
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
              </FormGroup>
              <Button type="submit" color="primary">
                Submit Review
              </Button>
            </Form>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default EcommerceSellerDetail;