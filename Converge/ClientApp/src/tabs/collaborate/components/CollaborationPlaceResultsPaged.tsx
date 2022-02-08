// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import {
  Box, Button, Flex, Loader, Text,
} from "@fluentui/react-northstar";
import { logEvent } from "../../../utilities/LogWrapper";
import CollaborationCampusPlaceCard from "../../workspace/components/CollaborationCampusPlaceCard";
import CollaborationPlacesRepeatingBox from "../../workspace/components/CollaborationPlacesRepeatingBox";
import CampusToCollaborate from "../../../types/CampusToCollaborate";
import VenueToCollaborate from "../../../types/VenueToCollaborate";
import CollaborationVenuePlaceCard from "../../workspace/components/CollaborationVenuePlaceCards";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../../../types/LoggerTypes";
import CollaborationPlaceResultsPagedStyles from "../styles/CollaborationPlaceResultsPagedStyles";
import { useSearchContextProvider, getCampusSearchNextRange } from "../../../providers/SearchProvider";
import { CollaborationVenueType } from "../../../types/ExchangePlace";

interface Props {
    places: (CampusToCollaborate | VenueToCollaborate)[];
    openPanel: () => void;
    setSelectedPlace: (selectedPlace: CampusToCollaborate | VenueToCollaborate) => void;
}

const CollaborationPlaceResultsPaged: React.FC<Props> = (props) => {
  const {
    places, openPanel, setSelectedPlace,
  } = props;
  const classes = CollaborationPlaceResultsPagedStyles();
  const {
    state,
    setVenueSkip,
    setCampusSearchRange,
    setCampusSearchWaiting,
    searchPlacesToCollaborate,
  } = useSearchContextProvider();

  const loadMoreResults = () => {
    setVenueSkip(state.venueSkip + 30);
  };

  const loadFartherPlaces = () => {
    setCampusSearchWaiting(true);
    const increasedSearchRange = getCampusSearchNextRange(state.campusSearchRangeInMiles);
    setCampusSearchRange(increasedSearchRange);
    searchPlacesToCollaborate(true, increasedSearchRange);
  };

  return (
    <Box className={classes.root}>
      <Box>
        <CollaborationPlacesRepeatingBox>
          {places
            .map((place) => (
              <Box
                key={
                  (place as VenueToCollaborate).venueId
                  || (place as CampusToCollaborate).identity
                }
                className={classes.lightTheme}
              >
                {(place as VenueToCollaborate).venueName ? (
                  <CollaborationVenuePlaceCard
                    placeToCollaborate={place as VenueToCollaborate}
                    onPlaceClick={() => {
                      openPanel();
                      setSelectedPlace(place);
                      logEvent(USER_INTERACTION, [
                        { name: UI_SECTION, value: UISections.CollaborateResults },
                        { name: DESCRIPTION, value: "open_place_details" },
                      ]);
                    }}
                  />
                ) : (
                  <CollaborationCampusPlaceCard
                    placeToCollaborate={place as CampusToCollaborate}
                    onPlaceClick={() => {
                      openPanel();
                      setSelectedPlace(place);
                      logEvent(USER_INTERACTION, [
                        { name: UI_SECTION, value: UISections.CollaborateResults },
                        { name: DESCRIPTION, value: "open_place_details" },
                      ]);
                    }}
                  />
                )}
              </Box>
            ))}
        </CollaborationPlacesRepeatingBox>
        {(
          state.venueType === CollaborationVenueType.FoodAndDrink
          || state.venueType === CollaborationVenueType.ParksAndRecreation
        ) && (
          <>
            <Flex hAlign="center" vAlign="center" style={{ marginTop: "8px" }}>
              {state.loadMorePlacesLoading === true
              && (<Loader />)}
            </Flex>
            <Flex hAlign="center" vAlign="center" style={{ marginTop: "8px" }}>
              {state.venueSkip < 1000 && state.loadMorePlacesLoading === false ? (
                <Button
                  content="Show more"
                  onClick={() => {
                    loadMoreResults();
                    logEvent(USER_INTERACTION, [
                      { name: UI_SECTION, value: UISections.CollaborateResults },
                      { name: DESCRIPTION, value: "loadMoreResults" },
                    ]);
                  }}
                />
              )
                : (
                  <Text
                    className={classes.textNoMore}
                  >
                    No more results
                  </Text>
                )}
            </Flex>
          </>
        )}
      </Box>
      <Box className={classes.loadBtnContainer}>
        {(
          (state.venueType === CollaborationVenueType.Workspace
          || state.venueType === CollaborationVenueType.ConferenceRoom)
        ) && (
          state.campusSearchRangeInMiles < 4000 ? (
            <Button
              onClick={() => {
                loadFartherPlaces();
                logEvent(USER_INTERACTION, [
                  { name: UI_SECTION, value: UISections.CollaborateResults },
                  { name: DESCRIPTION, value: "loadFartherPlaces" },
                ]);
              }}
              className={classes.showMoreBtn}
              disabled={state.campusSearchWaiting}
              loading={state.campusSearchWaiting}
              content="Show more"
            />
          )
            : (
              <Text
                className={classes.textNoMore}
              >
                No more results
              </Text>
            )
        )}
      </Box>
    </Box>
  );
};

export default CollaborationPlaceResultsPaged;
