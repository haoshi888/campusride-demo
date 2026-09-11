export const DEMO_MODE = true;
export const DEMO_BASE_TIME = "2026-09-20T17:00:00+08:00";
export const DEMO_PHONE_CODE = "123456";
export const DEMO_EMAIL_CODE = "888888";
export const SESSION_COOKIE = "campusride_user_id";
export const DEMO_TIME_COOKIE = "campusride_time_offset";

export const TRIP_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "FORMING",
  "CONFIRMED",
  "FULL",
  "DEPARTURE_PENDING",
  "TRAVELING",
  "COMPLETED",
  "SOLO_MODE",
  "CANCELLED",
  "EXPIRED",
] as const;

export type TripStatus = (typeof TRIP_STATUSES)[number];
export type MatchingScope = "SCHOOL" | "CITY" | "ALL";

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  DRAFT: "草稿",
  PUBLISHED: "等待同行",
  FORMING: "招募中",
  CONFIRMED: "已成团",
  FULL: "已满员",
  DEPARTURE_PENDING: "待出发",
  TRAVELING: "行程中",
  COMPLETED: "已完成",
  SOLO_MODE: "单独出行",
  CANCELLED: "已取消",
  EXPIRED: "已过期",
};

export const ACTIVE_TRIP_STATUSES: TripStatus[] = [
  "PUBLISHED",
  "FORMING",
  "CONFIRMED",
  "FULL",
  "DEPARTURE_PENDING",
  "TRAVELING",
];

export const JOINABLE_TRIP_STATUSES: TripStatus[] = ["PUBLISHED", "FORMING"];

export const MATCHING_SCOPE_LABELS: Record<MatchingScope, string> = {
  SCHOOL: "同校优先",
  CITY: "同城高校",
  ALL: "所有高校",
};

export const LUGGAGE_SIZE_OPTIONS = ["20寸左右", "24寸左右", "28寸左右", "其他"];
export const REVIEW_TAGS = {
  positive: ["守时", "好沟通", "可靠", "信息准确", "礼貌"],
  negative: ["迟到", "爽约", "信息不实", "沟通困难"],
};
export const REPORT_TYPES = ["虚假信息", "骚扰", "爽约", "不文明行为", "疑似诈骗", "其他"];
export const SENSITIVE_WORDS = ["色情", "诈骗", "辱骂", "赌博"];
