// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Flex, Divider } from "@fluentui/react-northstar";
import React, { useEffect, useState } from "react";
import { getReviews } from "../../../api/searchService";
import YelpReview from "../../../types/Review";

import VenueToCollaborate from "../../../types/VenueToCollaborate";
import Review from "./Review";
import VenueReviewsStyles from "../styles/VenueReviewsStyles";

interface Props {
  place: VenueToCollaborate;
}

const VenueReviews:React.FC<Props> = (props) => {
  const { place } = props;
  const classes = VenueReviewsStyles();
  const [reviews, setReviews] = useState<YelpReview[]>([]);
  useEffect(() => {
    getReviews(place.venueId).then((yelpReviews) => {
      setReviews(yelpReviews.response.reviews);
    });
  }, [place.venueId]);
  return (
    <Flex className={classes.reviewWrapper} column>
      <a href={place.urlReference} target="_blank" className={classes.link} rel="noreferrer">
        See all
        {" "}
        {place.reviewCount}
        {" "}
        reviews on Yelp
      </a>
      {reviews.map((review) => (
        <>
          <Review review={review} />
          <Divider />
        </>
      ))}
    </Flex>
  );
};

export default VenueReviews;
