import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

// Event types for the calendar
type CalendarEvent = {
  title: string;
  startCol: number;
  span: number;
  colorClass: string;
  outlineOnly?: boolean;
};

type WeekRow = {
  dates: (string | number)[];
  events: CalendarEvent[];
};

export default function ScheduleCalendar() {
  const weeks: WeekRow[] = [
    {
      dates: [13, 14, 15, 16, 17, 18, 19],
      events: [
        { title: "단과대석 신청 기간", startCol: 6, span: 2, colorClass: "bg-rose-500 text-white" },
        { title: "동아리석 신청 기간", startCol: 6, span: 2, colorClass: "bg-amber-500 text-white" },
      ]
    },
    {
      dates: [20, 21, 22, 23, 24, 25, 26],
      events: [
        { title: "단과대석 신청 기간", startCol: 1, span: 7, colorClass: "bg-rose-500 text-white" },
        { title: "동아리석 신청 기간", startCol: 1, span: 6, colorClass: "bg-amber-500 text-white" }, // spans 20-25 or 20-26? The image shows orange goes until Wed 30th. Wait, week 2 orange goes full 7 cols. But image shows it full. Let's make it 7.
      ]
    },
    {
      dates: [27, 28, 29, 30, "5/1", 2, 3],
      events: [
        { title: "단과대석 신청 기간", startCol: 1, span: 1, colorClass: "bg-rose-500 text-white" },
        { title: "동아리석 신청 기간", startCol: 1, span: 4, colorClass: "bg-amber-500 text-white" },
        { title: "단과대석 신청 오류 확인 기간", startCol: 5, span: 3, colorClass: "bg-emerald-500 text-white" },
      ]
    },
    {
      dates: [4, 5, 6, 7, 8, 9, 10],
      events: [
        { title: "단과대석 결제 기간", startCol: 1, span: 4, colorClass: "bg-teal-500 text-white" },
        { title: "단과대석 결제 확인 및 정정 기간", startCol: 5, span: 2, colorClass: "bg-sky-500 text-white" },
        { title: "환불 신청 기간", startCol: 7, span: 1, colorClass: "bg-indigo-500 text-white" },
        { title: "단과대석 당첨 발표", startCol: 1, span: 1, colorClass: "bg-teal-50 border border-teal-500 text-teal-700", outlineOnly: true },
      ]
    },
    {
      dates: [11, 12, 13, 14, 15, 16, 17],
      events: [
        { title: "환불 신청 기간", startCol: 1, span: 7, colorClass: "bg-indigo-500 text-white" },
      ]
    },
    {
      dates: [18, 19, 20, 21, 22, 23, 24],
      events: [
        { title: "환불 신청 기간", startCol: 1, span: 3, colorClass: "bg-indigo-500 text-white" },
        { title: "모바일 티켓 발송", startCol: 5, span: 3, colorClass: "bg-violet-600 text-white" },
        { title: "아카라카를 온누리에", startCol: 7, span: 1, colorClass: "bg-fuchsia-600 text-white" },
      ]
    }
  ];

  // Fix Week 2 orange span to 7
  weeks[1].events[1].span = 7;

  const daysOfWeek = [
    { name: "SUN", color: "text-rose-500" },
    { name: "MON", color: "text-gray-500" },
    { name: "TUE", color: "text-gray-500" },
    { name: "WED", color: "text-gray-500" },
    { name: "THU", color: "text-gray-500" },
    { name: "FRI", color: "text-gray-500" },
    { name: "SAT", color: "text-sky-500" },
  ];

  return (
    <Card className="shadow-xl border-primary/10 overflow-hidden mb-12 bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-b border-gray-100 pb-4">
        <CardTitle className="text-2xl font-extrabold text-[#113285] flex items-center">
          <CalendarDays className="w-7 h-7 mr-3 text-primary" />
          1. 전체 일정 안내
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {daysOfWeek.map((day, i) => (
              <div key={i} className={cn("py-3 text-center font-bold text-sm", day.color)}>
                {day.name}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="flex flex-col">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="border-b border-gray-100 relative group flex flex-col min-h-[100px]">

                {/* Dates Row */}
                <div className="grid grid-cols-7 absolute inset-0 pointer-events-none">
                  {week.dates.map((date, dateIdx) => (
                    <div
                      key={dateIdx}
                      className={cn(
                        "p-2 text-right text-sm font-medium border-r border-gray-50/50",
                        dateIdx === 0 ? "text-rose-500/80" : dateIdx === 6 ? "text-sky-500/80" : "text-gray-400"
                      )}
                    >
                      {date}
                    </div>
                  ))}
                </div>

                {/* Events Space (starts below dates) */}
                <div className="mt-8 mb-2 z-10 px-1 space-y-1">
                  {/* We use CSS grid for precise alignment of spans */}
                  <div className="grid grid-cols-7 gap-x-1 gap-y-1 relative">
                    {week.events.map((event, evtIdx) => (
                      <div
                        key={evtIdx}
                        className={cn(
                          "px-1 py-1 text-[10px] md:text-xs font-bold rounded-sm shadow-sm transition-all hover:scale-[1.01] hover:shadow-md cursor-default flex items-center justify-center text-center leading-tight whitespace-normal break-keep min-h-[28px]",
                          event.colorClass
                        )}
                        style={{
                          gridColumnStart: event.startCol,
                          gridColumnEnd: `span ${event.span}`
                        }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
