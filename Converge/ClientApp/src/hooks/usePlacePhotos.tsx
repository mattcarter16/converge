import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { PlacePhotosResult } from "../api/buildingService";
import { useApiProvider } from "../providers/ApiProvider";

const usePlacePhotos = (sharePointId: string): UseQueryResult<PlacePhotosResult> => {
  const { buildingService } = useApiProvider();
  return useQuery<PlacePhotosResult>({
    queryKey: [`place-photos-${sharePointId}`, sharePointId],
    queryFn: async () => buildingService.getPlacePhotos(sharePointId),
  });
};

export default usePlacePhotos;
