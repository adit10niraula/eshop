import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/outline";
import { useSelector, useDispatch } from "react-redux";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import {
  fetchActivityBasedRecommendationAsync,
  fetchActivityBasedRecommendationMLAsync,
  fetchInteractionBasedRecommendationAsync,
  fetchProductRecommendationAsync,
  selectActivityBasedRecommendation,
  selectActivityBasedRecommendationML,
  selectInteractionRecommendations,
  selectProductRecommendation,
} from "../../features/product/productListSlice";
import { fetchActivityBasedRecommendation, fetchActivityBasedRecommendationML } from "../../features/product/productListApi";

const RecommendationPage = ({ id }) => {
  const params = useParams();
  const dispatch = useDispatch();
  const [recommendation, setRecommendation] = useState([]);
  const interactionRecommendations = useSelector(selectActivityBasedRecommendation);
  const recommendations = useSelector(selectProductRecommendation);
  const mlRecommendations = useSelector(selectActivityBasedRecommendationML)

  console.log(mlRecommendations)

  useEffect(() => {
    dispatch(fetchActivityBasedRecommendationAsync());
    dispatch(fetchActivityBasedRecommendationMLAsync())
    dispatch(fetchProductRecommendationAsync(params.id));
  }, [params.id, dispatch]);

  useEffect(() => {
    if (recommendations) {
      setRecommendation(recommendations.filter((item) => item.similarity));
    }
  }, [recommendations]);

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1280 },
      items: 4,
      slidesToSlide: 4,
    },
    desktop: {
      breakpoint: { max: 1280, min: 1024 },
      items: 3,
      slidesToSlide: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1,
    },
  };

  return (
    <div className="p-4">
      {interactionRecommendations.length > 0 && (
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <h1 className="text-center font-bold text-4xl">Recommended for You</h1>

          <div className="w-2/3">
            <Carousel
              responsive={responsive}
              infinite={true}
              autoPlay={true}
              autoPlaySpeed={3000}
              keyBoardControl={true}
              customTransition="transform 200ms ease-in-out"
              showDots={true}
              transitionDuration={300}
              containerClass="carousel-container"
              removeArrowOnDeviceType={["tablet", "mobile"]}
              dotListClass="custom-dot-list-style"
              itemClass="carousel-item-padding-40-px px-2"
            >
              {interactionRecommendations
                .slice()
                .sort((a, b) => (b?.score || 0) - (a?.score || 0))
                .slice(0, 12)
                .map((item, index) => {
                  const product = item?.product;
                  if (!product) return null;

                  return (
                    <div
                      key={index}
                      className="flex flex-col gap-2 items-center justify-between p-2 h-full border border-black"
                    >
                      <Link
                        to={`/products/${product?._id?.$oid || product?._id}`}
                        className="flex justify-center w-full"
                      >
                        <img
                          src={`http://localhost:8080/uploads/${product?.thumbnail}`}
                          className="h-48 w-full object-contain rounded-lg"
                          alt={product?.title}
                        />
                      </Link>

                      <h3 className="text-center font-bold text-lg line-clamp-1">
                        {product?.title}
                      </h3>

                      <div className="flex gap-2">
                        <StarIcon className="w-6 h-6" />
                        <p>
                          {product?.totalRatings > 0
                            ? product?.rating / product?.totalRatings
                            : 0}
                        </p>
                      </div>

                      <div className="flex justify-between w-full">
                        {product?.discountPercentage ? (
                          <>
                            <del className="text-lg italic text-purple-700">
                              NRS {product?.price}
                            </del>
                            <p className="text-lg italic font-bold text-red-700">
                              NRS{" "}
                              {Math.round(
                                product?.price *
                                (1 - product?.discountPercentage / 100)
                              )}
                            </p>
                          </>
                        ) : (
                          <p className="text-lg italic text-purple-700">
                            NRS {product?.price}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </Carousel>
          </div>
        </div>
      )}
      {mlRecommendations.length > 0 && (
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <h1 className="text-center font-bold text-4xl">Based on Your Activities</h1>

          <div className="w-2/3">
            <Carousel
              responsive={responsive}
              infinite={true}
              autoPlay={true}
              autoPlaySpeed={3000}
              keyBoardControl={true}
              customTransition="transform 200ms ease-in-out"
              showDots={true}
              transitionDuration={300}
              containerClass="carousel-container"
              removeArrowOnDeviceType={["tablet", "mobile"]}
              dotListClass="custom-dot-list-style"
              itemClass="carousel-item-padding-40-px px-2"
            >
              {mlRecommendations
                .slice()
                .sort((a, b) => (b?.score || 0) - (a?.score || 0)) // Sort by score descending
                .slice(0, 12) // Limit to top 12 recommendations
                .map((item, index) => {
                  const product = item?.product;
                  if (!product) return null;

                  return (
                    <div
                      key={index}
                      className="flex flex-col gap-2 items-center justify-between p-2 h-full border border-black"
                    >
                      <Link
                        to={`/products/${product?._id?.$oid || product?._id}`}
                        className="flex justify-center w-full"
                      >
                        <img
                          src={`http://localhost:8080/uploads/${product?.thumbnail}`}
                          className="h-48 w-full object-contain rounded-lg"
                          alt={product?.title}
                        />
                      </Link>

                      <h3 className="text-center font-bold text-lg line-clamp-1">
                        {product?.title}
                      </h3>

                      <div className="flex gap-2">
                        <StarIcon className="w-6 h-6" />
                        <p>
                          {product?.totalRatings > 0
                            ? (product?.rating / product?.totalRatings).toFixed(1)
                            : 0}
                        </p>
                      </div>

                      <div className="flex justify-between w-full">
                        {product?.discountPercentage ? (
                          <>
                            <del className="text-lg italic text-purple-700">
                              NRS {product?.price}
                            </del>
                            <p className="text-lg italic font-bold text-red-700">
                              NRS{" "}
                              {Math.round(
                                product?.price *
                                (1 - product?.discountPercentage / 100)
                              )}
                            </p>
                          </>
                        ) : (
                          <p className="text-lg italic text-purple-700">
                            NRS {product?.price}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </Carousel>
          </div>
        </div>
      )}


      {recommendation.length > 0 && (
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-center font-bold text-4xl">Similar Products</h1>

          <div className="grid grid-cols-2 justify-center lg:grid-cols-3 gap-3">
            {recommendation?.map((item, index) => (
              <div
                key={index}
                className="relative flex flex-col gap-2 lg:items-stretch justify-between px-2 py-4 lg:w-72 shadow-lg"
              >
                <Link
                  to={`/products/${item?.item.id}`}
                  className="flex justify-center"
                >
                  <img
                    src={`http://localhost:8080/uploads/${item?.item.thumbnail}`}
                    className="max-h-56 w-[360px] object-cover"
                    alt=""
                  />
                </Link>

                <h3 className="text-center font-bold text-lg">
                  {item?.item.title}
                </h3>

                <div className="flex gap-2">
                  <StarIcon className="w-6 h-6" />
                  <p>
                    {item?.item.rating > 0
                      ? item?.item.rating / item?.item.totalRatings
                      : 0}
                  </p>
                </div>

                <div className="flex justify-between">
                  {item?.item.discountPercentage ? (
                    <>
                      <del className="text-lg italic text-purple-700">
                        NRS {item?.item.price}
                      </del>
                      <p className="text-lg italic font-bold text-red-700">
                        NRS{" "}
                        {Math.round(
                          item?.item.price *
                          (1 - item?.item.discountPercentage / 100)
                        )}
                      </p>
                    </>
                  ) : (
                    <p className="text-lg italic text-purple-700">
                      NRS {item?.item.price}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationPage;