import Markdown from "react-markdown";

export function MdRenderer({ children }: MdRendererProps) {
  return (
    <div className="leading-relaxed prose-sm">
      <Markdown>{children}</Markdown>
    </div>
  );
}

type MdRendererProps = {
  children: string;
};
