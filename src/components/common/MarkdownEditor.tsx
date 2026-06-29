"use client";

import React, { useRef } from "react";
import dynamic from "next/dynamic";

const Editor = dynamic(
    () => import("@toast-ui/react-editor").then((m) => m.Editor),
    { ssr: false }
);

interface MarkdownEditorProps {
    onChange?: (markdown: string) => void;
    initialValue?: string
}

export default function MarkdownEditor({ onChange, initialValue }: MarkdownEditorProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editorRef = useRef<any>(null);

    const handleChange = () => {
        const markdown = editorRef.current?.getInstance().getMarkdown();
        if (onChange) onChange(markdown);
    };

    return (
        <div className="bg-white dark:bg-gray-900">
            <Editor
                ref={editorRef}
                initialValue={initialValue}
                previewStyle="vertical"
                height="400px"
                initialEditType="wysiwyg"
                useCommandShortcut={true}
                onChange={handleChange}
            />
        </div>
    );
}
