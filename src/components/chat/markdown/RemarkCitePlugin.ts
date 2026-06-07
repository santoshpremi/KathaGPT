import { visit } from "unist-util-visit";
import type { Root, Text, Node } from 'mdast';
import type { VFile } from 'vfile';

interface DirectiveNode extends Node {
  type: 'containerDirective' | 'leafDirective' | 'textDirective';
  name: string;
  children: Node[];
  data?: Record<string, unknown>;
}

/**
 * Plugin to turn `:cite` directives into <cite> tags with a source attribute.
 */
const RemarkCitePlugin = () => {
  return (tree: Root, file: VFile) => {
    visit(tree, ['containerDirective', 'leafDirective', 'textDirective'], (node: any) => {
      const directive = node as DirectiveNode;
      if (directive.name !== "cite") {
        (directive as unknown as Text).type = "text";
        (directive as unknown as Text).value = ":" + directive.name;
        return;
      }

      const data = directive.data || (directive.data = {});

      if (directive.type !== "textDirective") {
        file.fail("Unexpected `:cite` directive, must be text", node);
      }

      const child = directive.children[0] as Text | undefined;
      if (!child || child.type !== "text") {
        return;
      }

      data.hName = "cite";
      data.hProperties = {
        source: child.value,
      };
    });
  };
};

export default RemarkCitePlugin;
