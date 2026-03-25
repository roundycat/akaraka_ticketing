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
        { title: "단과대석 신청 기간", startCol: 6, span: 2, colorClass: "bg-[#2B3586] text-[#FFFFFF]" },
        { title: "동아리석 신청 기간", startCol: 6, span: 2, colorClass: "bg-[#1593C6] text-[#FFFFFF]" },
      ]
    },
    {
      dates: [20, 21, 22, 23, 24, 25, 26],
      events: [
        { title: "단과대석 신청 기간", startCol: 1, span: 7, colorClass: "bg-[#2B3586] text-[#FFFFFF]" },
        { title: "동아리석 신청 기간", startCol: 1, span: 6, colorClass: "bg-[#1593C6] text-[#FFFFFF]" }, // spans 20-25 or 20-26? The image shows orange goes until Wed 30th. Wait, week 2 orange goes full 7 cols. But image shows it full. Let's make it 7.
      ]
    },
    {
      dates: [27, 28, 29, 30, "5/1", 2, 3],
      events: [
        { title: "단과대석 신청 기간", startCol: 1, span: 1, colorClass: "bg-[#2B3586] text-[#FFFFFF]" },
        { title: "동아리석 신청 기간", startCol: 1, span: 4, colorClass: "bg-[#1593C6] text-[#FFFFFF]" },
        { title: "단과대석 신청 오류 확인 기간", startCol: 5, span: 3, colorClass: "bg-[#E6F2F8] text-[#2B3586] border border-[#2B3586]/20" },
      ]
    },
    {
      dates: [4, 5, 6, 7, 8, 9, 10],
      events: [
        { title: "단과대석 결제 기간", startCol: 1, span: 4, colorClass: "bg-[#3B4CA8] text-[#FFFFFF]" },
        { title: "단과대석 결제 확인 및 정정 기간", startCol: 5, span: 2, colorClass: "bg-[#192055] text-[#FFFFFF]" },
        { title: "환불 신청 기간", startCol: 7, span: 1, colorClass: "bg-[#F0F0F0] text-[#656565] border border-gray-200" },
        { title: "단과대석 당첨 발표", startCol: 1, span: 1, colorClass: "bg-[#FFFFFF] border-2 border-[#F2A900] text-[#F2A900]", outlineOnly: true },
      ]
    },
    {
      dates: [11, 12, 13, 14, 15, 16, 17],
      events: [
        { title: "환불 신청 기간", startCol: 1, span: 7, colorClass: "bg-[#F0F0F0] text-[#656565] border border-gray-200" },
      ]
    },
    {
      dates: [18, 19, 20, 21, 22, 23, 24],
      events: [
        { title: "환불 신청 기간", startCol: 1, span: 3, colorClass: "bg-[#F0F0F0] text-[#656565] border border-gray-200" },
        { title: "모바일 티켓 발송", startCol: 5, span: 3, colorClass: "bg-[#222222] text-[#FFFFFF]" },
        { title: "아카라카를 온누리에", startCol: 7, span: 1, colorClass: "bg-[#F2A900] text-[#FFFFFF] border border-[#F2A900] shadow-md z-10" },
      ]
    }
  ];

  // Fix Week 2 orange span to 7
  weeks[1].events[1].span = 7;

  const daysOfWeek = [
    { name: "SUN", color: "text-[#E53E3E]" }, // Standard readable Red
    { name: "MON", color: "text-[#656565]" },
    { name: "TUE", color: "text-[#656565]" },
    { name: "WED", color: "text-[#656565]" },
    { name: "THU", color: "text-[#656565]" },
    { name: "FRI", color: "text-[#656565]" },
    { name: "SAT", color: "text-[#1593C6]" }, // Akaraka Cyan
  ];

  return (
    <Card className="shadow-xl border-primary/10 overflow-hidden mb-12 bg-white rounded-[1.5rem]">
      <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-b border-gray-100 pb-4 rounded-t-[1.5rem] -mx-[1px] -mt-[1px]">
        <CardTitle className="text-2xl font-extrabold text-[#113285] flex items-center">
          <CalendarDays className="w-7 h-7 mr-3 text-primary" />
          1. 전체 일정 안내
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-2 md:p-4 overflow-hidden">
        <div className="w-full">
          {/* Header */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 rounded-t-xl overflow-hidden">
            {daysOfWeek.map((day, i) => (
              <div key={i} className={cn("py-2 text-center font-bold text-[10px] sm:text-xs md:text-sm", day.color)}>
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
                          "px-[2px] py-1 text-[8.5px] sm:text-[10px] md:text-xs font-bold rounded-sm shadow-sm transition-all hover:scale-[1.01] hover:shadow-md cursor-default flex items-center justify-center text-center leading-[1.1] whitespace-pre-wrap break-words sm:break-keep min-h-[24px] md:min-h-[28px]",
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
