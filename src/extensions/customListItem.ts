import { ListItem } from "@tiptap/extension-list-item";

const CustomListItem = ListItem.extend({
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style") || null,
        renderHTML: (attributes) => {
          return attributes.style ? { style: attributes.style } : {};
        },
      },
    };
  },
});

export default CustomListItem;