// apps/website/src/utils/iconMapper.ts
import {
  FileText,
  Instagram,
  Mic,
  Mail,
  Linkedin,
  Youtube,
  BarChart3,
  Twitter,
  Share2,
  PenTool,
  Globe,
} from "lucide-react";

const ICON_MAP = {
  FileText: FileText,
  Instagram: Instagram,
  Mic: Mic,
  Mail: Mail,
  Linkedin: Linkedin,
  Youtube: Youtube,
  BarChart3: BarChart3,
  Twitter: Twitter,
  Share2: Share2,
  PenTool: PenTool,
  Globe: Globe,
};

export function getIconComponent(iconName: string) {
  return ICON_MAP[iconName as keyof typeof ICON_MAP] || FileText;
}
