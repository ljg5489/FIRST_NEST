# Recommendation and cost verification — 2026-09-18

## Behavior
- Results and recommendation API validate and forward region, days, people, budget basis, pace, transport, interests, nationality and language.
- Stable, paginated active-place selection stays in the chosen region. Local food uses FD; history/nature/family/photo/festival choices affect category selection. Family excludes explicitly unavailable stroller facilities, with an uncertainty notice. Photo preferences do not claim verified popularity. Sparse selections are disclosed rather than replaced with random distant locations.
- Pace controls the maximum of 2 / 3 / 4 stops per day. Distance limits are tighter for walking and public transport. Repeated places are excluded.
- Optional visits are removed when allowances exceed the budget; impossible budgets remain visibly over budget.
- Kakao driving response codes and summaries are checked. Missing permission, missing route, timeout or errors return explicitly labeled distance estimates. No failed call is presented as a successful zero-minute route. Permission failures use a short cooldown, and total route lookup time is bounded.
- Driving results preserve daily totals; overnight, accommodation and origin-to-destination travel are excluded and disclosed. Public transport and walking are estimates, not actual timetable or pedestrian routing.
- Costs include food, lodging, visit allowances and mode-specific transport. One-person budgets multiply by party size; accommodation uses 2 people/room and cars/taxis use 4 people/vehicle. Food visits are not charged twice.
- The amounts are planning allowances, not verified market prices: meal 12,000 KRW, room/night 80,000, non-food/non-accommodation visit 10,000 per person, transit/day 10,000 per person, rental/day 70,000 per vehicle plus 180/km and supplied tolls; taxi supplied quote or 5,000 + 1,200/km.
- Conditions, original routes and category metadata survive saved-course reloads. Editing destinations recalculates costs with distance estimates and displays the change. Existing courses without planning data still open normally.
- Random quality scores removed; preferred language forwarded to narrative generation. No schema or authentication permission changes.

## Verification
- Updated local Kakao key: HTTP 200, result_code 0, route summary present. No key printed or committed.
- 11 unit/regression tests passed, including invalid inputs, region/food/pace/walking/family selection, shared cost arithmetic, day boundaries, budget trimming, snapshot validation and Kakao failure handling.
- Local production build passed.
- 21 API integration checks passed with planning metadata round-trip. Isolated test identities signed out and deleted with their courses.
- Local browser: Gongju, 3 people, 2 days, rental car, history + food. Budget of 300,000/person became 900,000 total; real Kakao route showed 11 km / 28 min. Deleting a stop recalculated costs and switched route label to estimate.
- API: malformed conditions return 400. A 10,000 total budget for one-day walking retained one visit and showed a 46,000 estimate / 36,000 shortfall. Region and English narrative checked.

## Provider reference
- https://developers.kakaomobility.com/guide/navi-api/start
- https://developers.kakaomobility.com/guide/navi-api/directions
