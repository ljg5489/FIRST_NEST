import { attractions, recommendedCourse, travelConditionOptions } from "./mock-data";
import type { Attraction } from "./types";
import { getPlacesFromDB } from "./supabase/places";

function isAttraction(attraction: Attraction | undefined): attraction is Attraction {
  return Boolean(attraction);
}

export async function getTravelConditionOptions() {
  return travelConditionOptions;
}

export async function getAttractions() {
  const dbAttractions = await getPlacesFromDB();
  return dbAttractions.length > 0 ? dbAttractions : attractions;
}

export async function getAttractionById(id: string) {
  const allAttractions = await getAttractions();
  return allAttractions.find((attraction) => attraction.id === id) ?? allAttractions[0];
}

export async function getRecommendedCourse() {
  return recommendedCourse;
}

export async function getRecommendedCourseWithAttractions() {
  const course = await getRecommendedCourse();
  const allAttractions = await getAttractions();

  return {
    ...course,
    days: course.days.map((day) => ({
      ...day,
      attractions: day.attractionIds
        .map((id) => allAttractions.find((attraction) => attraction.id === id))
        .filter(isAttraction),
    })),
  };
}
