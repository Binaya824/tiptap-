import { OrderedList } from "@tiptap/extension-ordered-list";

const CustomOrderedList = OrderedList.extend({
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
});

export default CustomOrderedList;