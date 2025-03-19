import { ListItem } from "@tiptap/extension-list-item";

const CustomListItem = ListItem.extend({
  content: "(paragraph|bulletList|orderedList)*",
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style") || null,
        renderHTML: (attributes) => {
          return attributes.style ? { style: attributes.style } : {};
        },
      },
      "data-id": {  // Adding the dataset attribute
        default: null,
        parseHTML: (element) => element.getAttribute("data-id") || null,
        renderHTML: (attributes) => {
          return attributes["data-id"] ? { "data-id": attributes["data-id"] } : {};
        },
      },
    };
  },
  renderHTML({ node }) {
    // Check if the <li> has any <p> inside
    let hasParagraph = false;
    node.content.forEach((child) => {
      if (child.type.name === "paragraph") {
        hasParagraph = true;
      }
    });

    // Apply styles conditionally to remove marker when no <p> exists
    const attrs = {
      ...node.attrs,
      style: hasParagraph ? node.attrs.style : "list-style: none;",
    };

    return ["li", attrs, 0];
  },
});

export default CustomListItem;