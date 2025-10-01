"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
var supabase_1 = require("@oppsys/supabase");
var env_1 = require("../env");
exports.supabase = (0, supabase_1.createSupabaseClient)(
  env_1.env.SUPABASE_URL,
  env_1.env.SUPABASE_SERVICE_ROLE
);
