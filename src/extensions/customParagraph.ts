import { Paragraph } from "@tiptap/extension-paragraph";

const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style") || null,
        renderHTML: (attributes) => {
          return attributes.style ? { style: attributes.style } : {};
        },
      },
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute("class") || null,
        renderHTML: (attributes) => {
          return attributes.class ? { class: attributes.class } : {};
        },
      },
      "data-id": {  // Adding the dataset attribute
        default: null,
        parseHTML: (element) => element.getAttribute("data-id") || null,
        renderHTML: (attributes) => {
          return attributes["data-id"] ? { "data-id": attributes["data-id"] } : {};
        },
      },
      "data-page": {  // Adding the dataset attribute
        default: null,
        parseHTML: (element) => element.getAttribute("data-page") || null,
        renderHTML: (attributes) => {
          return attributes["data-page"] ? { "data-page": attributes["data-page"] } : {};
        },
      },
    };
  },
});

export default CustomParagraph;
