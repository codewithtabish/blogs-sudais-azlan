"use client";

import { Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type BlogEditorProps = {
  value?: any;
  onChange?: (data: any) => void;
  readOnly?: boolean;
};

const BlogEditor: React.FC<BlogEditorProps> = ({ value, onChange, readOnly = false }) => {
  const editorRef = useRef<any>(null);
  const holderRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let cancelled = false;

    const initEditor = async () => {
      if (!holderRef.current) return;

      try {
        const [
          { default: EditorJS },
          { default: Header },
          { default: Quote },
          { default: Warning },
          { default: Delimiter },
          { default: List },
          { default: NestedList },
          { default: ImageTool },
          { default: LinkTool },
          { default: AttachesTool },
          { default: CodeTool },
          { default: RawTool },
          { default: Marker },
          { default: InlineCode },
          { default: Table },
          { default: Embed },
          { default: Checklist },
          { default: TextVariantTune },
          { default: AlignmentTune },
        ] = await Promise.all([
          import("@editorjs/editorjs"),
          import("@editorjs/header"),
          import("@editorjs/quote"),
          import("@editorjs/warning"),
          import("@coolbytes/editorjs-delimiter"),
          import("@editorjs/list"),
          import("@editorjs/nested-list"),
          import("@editorjs/image"),
          import("@editorjs/link"),
          import("@editorjs/attaches"),
          import("@editorjs/code"),
          import("@editorjs/raw"),
          import("@editorjs/marker"),
          import("@editorjs/inline-code"),
          import("@editorjs/table"),
          import("@editorjs/embed"),
          import("@editorjs/checklist"),
          import("@editorjs/text-variant-tune"),
          import("editor-js-alignment-tune"),
        ]);

        // React Strict Mode may have unmounted this effect
        // while the dynamic imports were still loading.
        if (cancelled || !holderRef.current) return;

        // Temporary uploader.
        // Replace this with your S3 uploader when ready.
        const uploadInlineImageToS3 = async () => {
          toast.error("Inline image upload is not configured yet");

          return {
            success: 0,
          };
        };

        const editor = new EditorJS({
          holder: holderRef.current,
          readOnly,
          autofocus: !readOnly,

          placeholder: "Start writing your amazing blog post here...",

          data:
            value?.blocks && value.blocks.length > 0
              ? value
              : {
                  blocks: [],
                },

          tools: {
            header: {
              class: Header as any,
              inlineToolbar: true,
              tunes: ["alignmentTune"],

              config: {
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 2,
                placeholder: "Heading",
              },
            },

            paragraph: {
              inlineToolbar: true,
              tunes: ["alignmentTune", "textVariant"],
            },

            textVariant: {
              class: TextVariantTune as any,
            },

            alignmentTune: {
              class: AlignmentTune as any,
            },

            quote: {
              class: Quote as any,
              inlineToolbar: true,
              tunes: ["alignmentTune"],

              config: {
                quotePlaceholder: "Enter a quote",
                captionPlaceholder: "Author",
              },
            },

            warning: {
              class: Warning as any,
              inlineToolbar: true,
              tunes: ["alignmentTune"],

              config: {
                titlePlaceholder: "Title",
                messagePlaceholder: "Message",
              },
            },

            list: {
              class: List as any,
              inlineToolbar: true,

              config: {
                defaultStyle: "unordered",
              },
            },

            nestedlist: {
              class: NestedList as any,
              inlineToolbar: true,

              config: {
                defaultStyle: "unordered",
              },
            },

            checklist: {
              class: Checklist as any,
              inlineToolbar: true,
            },

            image: {
              class: ImageTool as any,

              config: {
                uploader: {
                  uploadByFile: uploadInlineImageToS3,

                  uploadByUrl: async (url: string) => ({
                    success: 1,

                    file: {
                      url,
                    },
                  }),
                },

                captionPlaceholder: "Image caption",
              },
            },

            linkTool: {
              class: LinkTool as any,

              config: {
                endpoint: "/api/fetch-url",
              },
            },

            embed: {
              class: Embed as any,
              inlineToolbar: true,

              config: {
                services: {
                  youtube: true,
                  vimeo: true,
                  twitter: true,
                  instagram: true,
                  codepen: true,
                  pinterest: true,
                  facebook: true,
                  twitch: true,
                },
              },
            },

            attaches: {
              class: AttachesTool as any,

              config: {
                endpoint: "/api/upload-attachment",
              },
            },

            code: {
              class: CodeTool as any,

              config: {
                placeholder: "Enter code...",
              },
            },

            raw: {
              class: RawTool as any,
            },

            table: {
              class: Table as any,
              inlineToolbar: true,

              config: {
                rows: 2,
                cols: 3,
              },
            },

            delimiter: {
              class: Delimiter as any,

              config: {
                styleOptions: ["star", "dash", "line"],
                defaultStyle: "star",
              },
            },

            marker: {
              class: Marker as any,
              shortcut: "CMD+SHIFT+M",
            },

            inlineCode: {
              class: InlineCode as any,
              shortcut: "CMD+SHIFT+C",
            },
          },

          tunes: ["textVariant", "alignmentTune"],

          onReady: () => {
            if (cancelled) {
              editor.destroy();
              return;
            }

            editorRef.current = editor;
            setIsReady(true);
          },

          onChange: async () => {
            if (cancelled || !onChangeRef.current) return;

            const saved = await editor.save();

            if (!cancelled) {
              onChangeRef.current(saved);
            }
          },
        });

        // If the component was unmounted while EditorJS
        // was being initialized, immediately destroy it.
        if (cancelled) {
          editor.destroy();
          return;
        }

        editorRef.current = editor;
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to initialize editor:", error);
        toast.error("Failed to load editor");
      }
    };

    initEditor();

    return () => {
      cancelled = true;

      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }

      setIsReady(false);
    };
  }, [readOnly]);

  return (
    <div className="relative">
      {!isReady && (
        <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />

            <p className="text-sm text-muted-foreground">Loading editor...</p>
          </div>
        </div>
      )}

      <div
        ref={holderRef}
        className={`min-h-[400px] ${isReady ? "rounded-xl border bg-background p-4" : "hidden"}`}
      />
    </div>
  );
};

export default BlogEditor;
