import Prism from "prismjs";
import "prismjs/components/prism-markdown";
import React, { useCallback, useState } from "react";
import { BaseRange, createEditor, Descendant, NodeEntry, Text } from "slate";
import { Slate, Editable, withReact, RenderLeafProps } from "slate-react";
import markdown from "remark-parse";
import slate, { LeafType, serialize } from "remark-slate";
import { unified } from "unified";

export default function TextEditor({
  initialValue,
  onChange,
}: {
  initialValue: string;
  onChange: (value: string) => void;
}) {
  const [editor] = useState(() => withReact(createEditor()));
  const [value, setValue] = useState<Descendant[]>(
    markdownToSlate(initialValue),
  );
  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    [],
  );

  const handleChange = useCallback(
    (nextValue: Descendant[]) => {
      console.log(nextValue);
      setValue(nextValue);
      onChange(value.map((v) => serialize(v as LeafType)).join(""));
    },
    [onChange],
  );

  const decorate = useCallback(([node, path]: NodeEntry): BaseRange[] => {
    const ranges: BaseRange[] = [];

    if (!Text.isText(node)) {
      return ranges;
    }

    const getLength = (token: Prism.Token | string): number => {
      if (typeof token === "string") {
        return token.length;
      } else if (typeof token.content === "string") {
        return token.content.length;
      } else {
        return (token.content as Prism.Token[]).reduce(
          (l, t) => l + getLength(t),
          0,
        );
      }
    };

    const tokens = Prism.tokenize(node.text, Prism.languages.markdown);
    let start = 0;

    for (const token of tokens) {
      const length = getLength(token);
      const end = start + length;

      if (typeof token !== "string") {
        ranges.push({
          [token.type]: true,
          anchor: { path, offset: start },
          focus: { path, offset: end },
        });
      }

      start = end;
    }

    return ranges;
  }, []);

  return (
    <Slate editor={editor} initialValue={value} onChange={handleChange}>
      <Editable
        renderLeaf={renderLeaf}
        decorate={decorate}
        placeholder="Markdown..."
      />
    </Slate>
  );
}

function markdownToSlate(md: string): Descendant[] {
  const out = unified().use(markdown).use(slate).processSync(md)
    .result as LeafType[];
  return out;
}

const Leaf = ({
  attributes,
  children,
  leaf,
}: RenderLeafProps & { leaf: LeafType }) => {
  return (
    <span {...attributes} className={`${leaf.bold ? "font-bold" : ""}`}>
      {children}
    </span>
  );
};
