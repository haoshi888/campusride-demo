import { z } from "zod";
import { LUGGAGE_SIZE_OPTIONS } from "@/lib/constants";

export const createTripSchema = z.object({
  origin: z.string().trim().min(1, "请填写出发地").max(60),
  destination: z.string().trim().min(1, "请填写目的地").max(60),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "请选择出发日期"),
  departureTime: z.string().regex(/^\d{2}:\d{2}$/, "请选择出发时间"),
  timeFlexibilityMinutes: z.coerce.number().int().min(0).max(120),
  minMembers: z.coerce.number().int().min(2),
  maxMembers: z.coerce.number().int().max(6),
  luggageCount: z.coerce.number().int().min(0).max(8),
  luggageSizes: z.array(z.enum(LUGGAGE_SIZE_OPTIONS as [string, ...string[]])).default([]),
  hasOversizedLuggage: z.boolean().default(false),
  matchingScope: z.enum(["SCHOOL", "CITY", "ALL"]),
  deadlineMinutesBeforeDeparture: z.coerce.number().int().min(15).max(720),
}).refine((data) => data.minMembers < data.maxMembers, {
  message: "最低成团人数必须小于最大人数",
  path: ["minMembers"],
});

export const joinTripSchema = z.object({
  luggageCount: z.coerce.number().int().min(0).max(8),
  luggageSizes: z.array(z.string()).default([]),
});

export const reportSchema = z.object({
  reportedUserId: z.string().optional(),
  tripId: z.string().optional(),
  type: z.string().min(1),
  description: z.string().trim().min(5, "请补充具体说明").max(500),
});

export const reviewSchema = z.object({
  tripId: z.string().min(1),
  reviews: z.array(z.object({
    revieweeId: z.string().min(1),
    rating: z.coerce.number().int().min(1).max(5),
    tags: z.array(z.string()).default([]),
    comment: z.string().max(300).optional(),
  })).min(1),
});
