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
      console.clear();
      setValue(nextValue);
      onChange(value.map((v) => serialize(v as LeafType)).join(""));
    },
    [onChange],
  );

  const decorate = useCallback(([node, path]: NodeEntry): BaseRange[] => {
    const ranges: BaseRange[] = [];
    let start = 0;
    let tokens: (string | Prism.Token)[] = [];

    function findPosition(
      strings: string[],
      index: number,
      start: boolean = true,
    ): { stringIndex: number; charIndex: number } {
      let cumulativeIndex = 0;

      for (let i = 0; i < strings.length; i++) {
        for (let j = 0; j < strings[i].length; j++) {
          if (cumulativeIndex === index) {
            return { stringIndex: i, charIndex: j };
          }
          cumulativeIndex++;
        }
        if (!start && cumulativeIndex === index) {
          return { stringIndex: i, charIndex: strings[i].length };
        }
      }

      return {
        stringIndex: strings.length - 1,
        charIndex: strings[strings.length - 1].length,
      };
    }

    const getLength = (token: Prism.Token | string): number => {
      if (typeof token === "string") {
        return token.replaceAll("\n", "").length;
      } else if (typeof token.content === "string") {
        return token.content.replaceAll("\n", "").length;
      } else {
        return (token.content as Prism.Token[]).reduce(
          (l, t) => l + getLength(t),
          0,
        );
      }
    };

    const getText = (node: NodeEntry[0]): string => {
      if (Text.isText(node)) {
        return node.text;
      } else {
        return (node.children as NodeEntry[0][]).map(getText).join("\n");
      }
    };

    tokens = Prism.tokenize(getText(node), Prism.languages.markdown);
    for (const token of tokens) {
      const length = getLength(token);
      const end = start + length;
      if (typeof token !== "string") {
        // console.log(token, start, end);
        // console.log(JSON.stringify(node));
        if (path.length > 0) {
          // continue;
          ranges.push({
            [token.type]: true,
            anchor: { path: path, offset: start },
            focus: { path: path, offset: end },
          });
        } else {
          const strings = ((node as any).children as NodeEntry[0][]).map(
            getText,
          );
          const pos1 = findPosition(strings, start, true);
          const pos2 = findPosition(strings, end, false);
          ranges.push({
            [token.type]: true,
            anchor: { path: [pos1.stringIndex], offset: pos1.charIndex },
            focus: { path: [pos2.stringIndex], offset: pos2.charIndex },
          });
        }
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
  const leaves = Object.keys(leaf).filter((k) => k !== "text");
  if (leaves.length > 0) {
    // console.log(leaves);
  }
  if (leaf["code"]) {
    return (
      <span {...attributes} className={`rounded-md bg-red-200 p-1 font-mono`}>
        {children}
      </span>
    );
  }
  return (
    <span
      {...attributes}
      className={` ${leaf.bold ? "font-bold" : ""} ${leaf["code-snippet"] ? "rounded-md bg-gray-400" : ""} ${leaf.italic ? "italic" : ""} ${leaf.strikeThrough ? "line-through" : ""} ${leaf["punctuation"] ? "opacity-20" : ""}`}
    >
      {children}
    </span>
  );
};
