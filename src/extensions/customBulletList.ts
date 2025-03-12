import { BulletList } from "@tiptap/extension-bullet-list";

const CustomBulletList = BulletList.extend({
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

export default CustomBulletList;
