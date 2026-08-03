"use client";

import { useMemo, useState } from "react";

type ItineraryPlace = {
  id: string;
  name: string;
  region: string;
};

type ItineraryDayItem = {
  day: string;
  region: string;
  attractions: ItineraryPlace[];
};

type EditableItineraryProps = {
  initialDays: ItineraryDayItem[];
};

function makeId() {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function EditableItinerary({ initialDays }: EditableItineraryProps) {
  const [startDate, setStartDate] = useState("");
  const [days, setDays] = useState(initialDays);
  const [selectedDay, setSelectedDay] = useState(initialDays[0]?.day ?? "Day 1");
  const [newPlaceName, setNewPlaceName] = useState("");

  const selectedDayItem = useMemo(
    () => days.find((day) => day.day === selectedDay) ?? days[0],
    [days, selectedDay],
  );

  const addPlace = () => {
    const trimmed = newPlaceName.trim();
    if (!trimmed || !selectedDayItem) {
      return;
    }

    setDays((currentDays) =>
      currentDays.map((day) =>
        day.day === selectedDay
          ? {
              ...day,
              attractions: [
                ...day.attractions,
                {
                  id: makeId(),
                  name: trimmed,
                  region: day.region,
                },
              ],
            }
          : day,
      ),
    );
    setNewPlaceName("");
  };

  const removePlace = (dayName: string, placeId: string) => {
    setDays((currentDays) =>
      currentDays.map((day) =>
        day.day === dayName
          ? {
              ...day,
              attractions: day.attractions.filter((place) => place.id !== placeId),
            }
          : day,
      ),
    );
  };

  return (
    <section className="grid gap-4">
      <div className="soft-card rounded-lg p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1fr_auto] lg:items-end">
          <label className="grid gap-2 text-sm font-bold">
            여행 시작일
            <input
              type="date"
              className="field-control"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            일정 추가
            <input
              className="field-control"
              placeholder="예: 로컬 카페, 숙소 체크인"
              value={newPlaceName}
              onChange={(event) => setNewPlaceName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addPlace();
                }
              }}
            />
          </label>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto] lg:flex">
            <select
              className="field-control lg:w-28"
              value={selectedDay}
              onChange={(event) => setSelectedDay(event.target.value)}
            >
              {days.map((day) => (
                <option key={day.day} value={day.day}>
                  {day.day}
                </option>
              ))}
            </select>
            <button type="button" className="primary-button border-0" onClick={addPlace}>
              추가
            </button>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#5d675f]">
          지금은 화면에서만 수정됩니다. 이후 DB 저장 기능이 연결되면 이 일정 상태를 저장하면 됩니다.
        </p>
      </div>

      {days.map((item) => (
        <article key={item.day} className="soft-card rounded-lg p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{item.day}</h2>
              {startDate ? (
                <p className="mt-1 text-sm text-[#667165]">
                  {startDate}부터 {item.day.replace("Day ", "")}일차
                </p>
              ) : null}
            </div>
            <span className="rounded-md bg-[#e8f1eb] px-3 py-1 text-sm font-semibold text-[#1f6b4f]">
              {item.region}
            </span>
          </div>
          <ol className="mt-4 grid gap-2">
            {item.attractions.length > 0 ? (
              item.attractions.map((place, index) => (
                <li
                  key={place.id}
                  className="grid gap-3 rounded-md bg-[#f7f8f5] px-4 py-3 text-sm sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <span>
                    {index + 1}. {place.name}
                  </span>
                  <div className="flex gap-2 sm:justify-self-end">
                    <a href={`/attractions/${place.id}`} className="action-button-secondary">
                      상세
                    </a>
                    <button
                      type="button"
                      className="action-button-danger"
                      onClick={() => removePlace(item.day, place.id)}
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li className="rounded-md bg-[#f7f8f5] px-4 py-3 text-sm text-[#667165]">
                아직 일정이 없습니다. 위에서 일정을 추가해보세요.
              </li>
            )}
          </ol>
        </article>
      ))}
    </section>
  );
}
