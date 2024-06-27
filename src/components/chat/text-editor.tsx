import Prism from "prismjs";
import React, { useCallback, useEffect, useState } from "react";
import {
  BaseRange,
  createEditor,
  Descendant,
  Node,
  NodeEntry,
  Text,
} from "slate";
import { Slate, Editable, withReact, RenderLeafProps } from "slate-react";
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
      onChange(nextValue.map((n) => Node.string(n)).join("\n"));
    },
    [onChange],
  );

  const decorate = useCallback(([node, path]: NodeEntry): BaseRange[] => {
    const ranges: BaseRange[] = [];
    let start = 0;

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

    const tokens = Prism.tokenize(getText(node), Prism.languages.markdown);

    const addTokens = (tokens: (string | Prism.Token)[]) => {
      const nextTokens: (string | Prism.Token)[] = [];
      for (const token of tokens) {
        const length = getLength(token);
        const end = start + length;
        if (typeof token !== "string") {
          if (token.content) {
            if (Array.isArray(token.content)) {
              nextTokens.push(...token.content);
            } else {
              nextTokens.push(token.content);
            }
          }
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
      // nextTokens.length > 0 && addTokens(nextTokens);
    };
    addTokens(tokens);
    return ranges;
  }, []);

  return (
    <Slate editor={editor} initialValue={value} onChange={handleChange}>
      <Editable
        className="focus:outline-none active:outline-none"
        renderLeaf={renderLeaf}
        decorate={decorate}
        placeholder="Markdown..."
      />
    </Slate>
  );
}

function markdownToSlate(md: string): Descendant[] {
  return md.split("\n").map((line) => {
    return { type: "paragraph", children: [{ text: line }] };
  });
}

const Leaf = ({
  attributes,
  children,
  leaf,
}: { leaf: { [key: string]: boolean } } & RenderLeafProps) => {
  const leaves = Object.keys(leaf).filter((k) => k !== "text");
  const styles: { [key: string]: string } = {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    "line-through": "line-through",
    "code-snippet": "font-mono bg-gray-300 p-1 rounded-md",
    code: "font-mono bg-gray-300 p-1 w-full flex flex-row",
    punctuation: "text-gray-500",
    title: "text-2xl font-bold",
    blockquote: "border-l-4 border-gray-500 pl-2",
    strike: "line-through",
    url: "text-blue-500",
    list: "list-disc ml-4",
    table: "border-collapse border border-gray-300 w-full text-left",
  };
  const missingStyles = leaves.filter((l) => !Object.keys(styles).includes(l));
  if (missingStyles.length > 0) {
    console.warn(`Missing styles: ${missingStyles.join(", ")}`);
  }
  const classes = leaves
    .map((l) => styles[l] ?? "")
    .filter((s) => s !== "")
    .join(" ");
  if (leaves.includes("code")) {
    return (
      <div {...attributes} className={classes}>
        {children}
      </div>
    );
  }
  return (
    <span {...attributes} className={classes}>
      {children}
    </span>
  );
};
