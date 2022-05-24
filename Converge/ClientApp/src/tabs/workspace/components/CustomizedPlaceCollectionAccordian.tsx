// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect } from "react";
import {
  Accordion, Button, Flex, Box, Divider, ErrorIcon, Loader,
} from "@fluentui/react-northstar";

import PlaceCard from "./PlaceCard";
import RepeatingBox from "./RepeatingBox";
import { useProvider as PlaceFilterProvider } from "../../../providers/PlaceFilterProvider";
import { logEvent } from "../../../utilities/LogWrapper";
import {
  USER_INTERACTION, UISections, UI_SECTION, DESCRIPTION,
} from "../../../types/LoggerTypes";
import ExchangePlace, { PlaceType } from "../../../types/ExchangePlace";
import useBuildingPlaces from "../../../hooks/useBuildingPlaces";
import BuildingBasicInfo from "../../../types/BuildingBasicInfo";
import { useApiProvider } from "../../../providers/ApiProvider";
import IsThisHelpful from "../../../utilities/IsThisHelpful";

interface Props {
  closestBuilding: BuildingBasicInfo;
  favoriteCampuses: ExchangePlace[];
  getSkipToken:(skipToken:string)=>void;
}

const CustomizedPlaceCollectionAccordian: React.FC<Props> = (props) => {
  const { closestBuilding, favoriteCampuses, getSkipToken } = props;
  const { state, updateLocation } = PlaceFilterProvider();
  const { buildingService } = useApiProvider();
  const {
    placesLoading,
    places,
    placesError,
    requestBuildingPlaces,
    hasMore,
  } = useBuildingPlaces(buildingService, closestBuilding.identity);
  const [count, setCount] = React.useState(4);

  useEffect(() => {
    requestBuildingPlaces(
      state.place,
      count,
      {
        isWheelchairAccessible: state.attributeFilter.indexOf("isWheelChairAccessible") > -1,
        hasAudio: state.attributeFilter.indexOf("audioDeviceName") > -1,
        hasDisplay: state.attributeFilter.indexOf("displayDeviceName") > -1,
        hasVideo: state.attributeFilter.indexOf("videoDeviceName") > -1,
        fullyEnclosed: state.attributeFilter.indexOf("fullyEnclosed") > -1,
        surfaceHub: state.attributeFilter.indexOf("surfaceHub") > -1,
        whiteboardCamera: state.attributeFilter.indexOf("whiteboardCamera") > -1,
      },
      null,
      true,
    ).then((s) => {
      getSkipToken(s.skipToken);
    });
  }, [
    closestBuilding.identity,
    state.place,
    state.attributeFilter,
    state.location,
  ]);

  const handleCustomizedAccordionChange = () => {
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.PlaceResults },
      { name: DESCRIPTION, value: "accordion_change" },
    ]);
  };

  const onLoadPlacesAgain = async () => {
    logEvent(USER_INTERACTION, [
      { name: UI_SECTION, value: UISections.PlaceResults },
      { name: DESCRIPTION, value: "load_places_again" },
    ]);
    await requestBuildingPlaces(
      state.place,
      4,
      {
        isWheelchairAccessible: state.attributeFilter.indexOf("isWheelChairAccessible") > -1,
        hasAudio: state.attributeFilter.indexOf("audioDeviceName") > -1,
        hasDisplay: state.attributeFilter.indexOf("displayDeviceName") > -1,
        hasVideo: state.attributeFilter.indexOf("videoDeviceName") > -1,
        fullyEnclosed: state.attributeFilter.indexOf("fullyEnclosed") > -1,
        surfaceHub: state.attributeFilter.indexOf("surfaceHub") > -1,
        whiteboardCamera: state.attributeFilter.indexOf("whiteboardCamera") > -1,
      },
      null,
      true,
    ).then((s) => {
      getSkipToken(s.skipToken);
    });
  };

  const determineFavoritePanel = () => {
    if (favoriteCampuses === undefined) {
      return {
        title: "Your favorites",
        content: (
          <Box>
            <Divider vertical>
              <ErrorIcon />
              {/* TODO: Add retry logic with user clickable retry button here */}
              Something went wrong when loading your favorite campuses.
            </Divider>
          </Box>
        ),
      };
    }
    if (favoriteCampuses.filter((b) => b.type === state.place).length > 0) {
      return {
        title: "Your favorites",
        content: (
          <Box>
            {favoriteCampuses.filter((b) => b.type === state.place).length > 0 && (
            <>
              <Flex hAlign="end" styles={{ position: "relative" }}>
                {favoriteCampuses.filter((b) => b.type === state.place).length > 3 && (
                <Button
                  text
                  content={`See more (${favoriteCampuses.filter((b) => b.type === state.place).length - 3})`}
                  onClick={() => {
                    updateLocation("Favorites");
                    setCount(10);
                    logEvent(USER_INTERACTION, [
                      { name: UI_SECTION, value: UISections.PlaceResults },
                      { name: DESCRIPTION, value: "see_more_favorites" },
                    ]);
                  }}
                  styles={{
                    color: "#6264A7", position: "absolute", top: "-34px", cursor: "pointer",
                  }}
                />
                )}
              </Flex>
              <Box styles={{ paddingTop: "1em" }}>
                <RepeatingBox>
                  {favoriteCampuses.filter((b) => b.type === state.place)
                    .slice(0, 3).map((place) => (
                      <PlaceCard
                        key={`favorites_${place.identity}`}
                        place={place}
                        buildingName={place.building}
                      />
                    ))}
                </RepeatingBox>
              </Box>
            </>
            )}
          </Box>
        ),
      };
    }
    return undefined;
  };

  const favoritesPanel = determineFavoritePanel();

  const determineClosestBuildingPanel = () => ({
    title: `Closest to you - ${closestBuilding.displayName}`,
    content: (
      <Box>
        {placesLoading && <Loader />}
        {!placesLoading && placesError && (
          <>
            <ErrorIcon />
            Could not load places for
            {" "}
            {closestBuilding.displayName}
            .
            {" "}
            <Button
              content="Please try again."
              type="link"
              onClick={onLoadPlacesAgain}
            />
          </>
        )}
        {!placesError && places.length === 0 && !placesLoading && (
          <Divider vertical>
            {`This building does not have any ${state.place === PlaceType.Space ? "workspaces" : "conference rooms"}`}
          </Divider>
        )}
        {!placesLoading && places.length > 0 && (
          <>
            <Flex hAlign="end" styles={{ position: "relative" }}>
              {hasMore && (
              <Button
                text
                content="See more"
                onClick={() => {
                  updateLocation(closestBuilding.identity);
                  setCount(10);
                  logEvent(USER_INTERACTION, [
                    { name: UI_SECTION, value: UISections.PlaceResults },
                    { name: DESCRIPTION, value: `see_more_buildings_${closestBuilding.displayName}` },
                  ]);
                }}
                styles={{
                  color: "#6264A7", position: "absolute", top: "-34px", cursor: "pointer",
                }}
              />
              )}
            </Flex>
            <Box styles={{ paddingTop: "1em" }}>
              <RepeatingBox>
                {places
                  .slice(0, 3).map((place) => (
                    <PlaceCard
                      key={`closestBuilding_${place.identity}`}
                      place={place}
                      buildingName={closestBuilding.displayName}
                    />
                  ))}
              </RepeatingBox>
            </Box>
          </>
        )}
      </Box>
    ),
  });

  const closestBuildingPanel = determineClosestBuildingPanel();

  const newCustomizedPanels = favoritesPanel !== undefined
    ? [favoritesPanel, closestBuildingPanel] : [closestBuildingPanel];

  return (
    <Box>
      <Accordion
        panels={newCustomizedPanels}
        defaultActiveIndex={newCustomizedPanels.map((p, i) => i)}
        onActiveIndexChange={handleCustomizedAccordionChange}
      />
      <Box>
        <IsThisHelpful logId="3938cd30" sectionName={UISections.PlaceResults} />
      </Box>
    </Box>
  );
};

export default CustomizedPlaceCollectionAccordian;
