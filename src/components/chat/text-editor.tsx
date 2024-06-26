import Prism from "prismjs";
import React, { useCallback, useEffect, useState } from "react";
import { BaseRange, createEditor, Descendant, NodeEntry, Text } from "slate";
import { Slate, Editable, withReact, RenderLeafProps } from "slate-react";
import markdown from "remark-parse";
import slate, { LeafType, serialize } from "remark-slate";
import { unified } from "unified";

import "prismjs/components/prism-markdown";

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

  useEffect(() => {
    const { insertSoftBreak } = editor;

    editor.insertBreak = () => {
      insertSoftBreak();
      return;
    };
  }, []);

  const renderLeaf = useCallback(
    // @ts-ignore
    (props: RenderLeafProps) => <Leaf {...props} />,
    [],
  );

  const handleChange = useCallback(
    (nextValue: Descendant[]) => {
      setValue(nextValue);
      onChange(value.map((v) => serialize(v as LeafType)).join(""));
    },
    [onChange],
  );

  const decorate = useCallback(([node, path]: NodeEntry): BaseRange[] => {
    console.log(path);
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

      // console.log(token);

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
}: { leaf: LeafType & { [key: string]: boolean } } & RenderLeafProps) => {
  // console.log(leaf);
  return (
    <span
      {...attributes}
      className={` ${leaf.bold ? "font-bold" : ""} ${leaf["code-snippet"] ? "rounded-md bg-gray-400" : ""} ${leaf.italic ? "italic" : ""} ${leaf.strikeThrough ? "line-through" : ""} ${leaf["punctuation"] ? "opacity-20" : ""}`}
    >
      {children}
    </span>
  );
};
