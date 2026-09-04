import {LlmAgent, SequentialAgent} from '@google/adk';

const GEMINI_MODEL = 'gemini-flash-latest';

// --- Agent 1: Finds attractions for the destination ---
const placeFinderAgent = new LlmAgent({
  name: 'PlaceFinderAgent',
  model: GEMINI_MODEL,
  description: 'Finds top attractions and places to visit for a travel destination.',
  instruction: `You are a knowledgeable travel guide.
Based *only* on the destination and trip length in the user's request, list the
top attractions and places to visit.

Output *only* a bullet list of 5 to 8 places, each with a short one-line
description. Do not add any greeting, introduction, or closing remarks.`,
  outputKey: 'places_to_visit',
});

// --- Agent 2: Suggests hotels based on the places found above ---
const hotelFinderAgent = new LlmAgent({
  name: 'HotelFinderAgent',
  model: GEMINI_MODEL,
  description: 'Recommends hotels for a trip based on the places being visited.',
  instruction: `You are an expert hotel recommendation assistant.

The traveler is visiting these places during their trip:
{places_to_visit}

Based on the destination from the user's original request and the places
listed above, recommend exactly 3 hotel options: one budget, one mid-range,
and one luxury. For each, give a plausible hotel name, its tier, and a
one-line reason it's a good fit given the places being visited.

Output *only* a bullet list of the 3 hotels. Do not add any other text.`,
  outputKey: 'hotel_recommendations',
});

// --- Assemble the pipeline: places -> hotels -> itinerary, in that order ---
const itineraryAgent = new LlmAgent({
  name: 'ItineraryAgent',
  model: GEMINI_MODEL,
  description: 'Builds a day-by-day itinerary from places to visit and hotel options.',
  instruction: `You are a professional travel itinerary planner.

Using the information below, build a clear day-by-day itinerary that matches
the trip length mentioned in the user's original request.

**Places to visit:**
{places_to_visit}

**Hotel options:**
{hotel_recommendations}

Task:
1. Group the places into a sensible day-by-day schedule.
2. Recommend which single hotel option best fits this trip, with one sentence why.
3. Format the result as a friendly markdown itinerary with a heading per day.`,
  outputKey: 'final_itinerary',
});

// --- Assemble the pipeline: places -> hotels -> itinerary, in that order ---
const travelPlannerAgent = new SequentialAgent({
  name: 'TravelPlannerAgent',
  subAgents: [placeFinderAgent, hotelFinderAgent, itineraryAgent],
  description:
    'Plans a full trip by finding places to visit, then hotel options, then building a day-by-day itinerary.',
});

// Export the root agent for the ADK to run
// ADK looks for a `rootAgent` export to know what to run
export const rootAgent = travelPlannerAgent;