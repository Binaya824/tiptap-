'use client'
import PageEditor from '@/components/PageEditor'
import Tiptap from '@/components/Tiptap'
import React , { useEffect, useRef, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import axios from 'axios'
import { Loader2 } from 'lucide-react'


type Props = {}

const page = (props: Props) => {

  const leftTiptapRef = useRef<{
    editor: any, getContent: () => string , setContent: (html: string) => void 
}  | null>(null)
  const rightTiptapRef = useRef<{
    editor: any, getContent: () => string 
} | null>(null)

  const page_array = ['<p data-id="element-1" style="font-size:21.958333333333336px;font-weight:700;font-style:normal;">OCRPro.ai - Document Data Extraction Solution</p><p data-id="element-2" style="font-size:16.791666666666668px;font-weight:700;font-style:normal;">Introduction</p><p data-id="element-3" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;">OCRPro.ai is an advanced document processing application that utilizes state-of-the-art technologies in Optical Character Recognition (OCR) and machine learning to extract structured data from documents. It simplifies the process of converting raw document content into usable, structured information that can be further processed, analyzed, or stored in various formats. This solution is designed for businesses that deal with large volumes of documents, such as invoices, tenders, and contracts and need to automate data extraction for efficiency and accuracy.</p><p data-id="element-4" style="font-size:16.791666666666668px;font-weight:700;font-style:normal;">Key Features</p><ol data-id="element-5"><li data-id="element-6" style="font-size:14.208333333333334px;"><p data-id="element-7" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> PDF to Image Conversion OCRPro.ai begins by accepting a document in PDF format, ensuring compatibility with various types of documents. The application then converts the PDF pages into high-quality images. This step is critical as it prepares the document for accurate OCR processing, which works more efficiently on image files rather than raw PDF content.</p></li><li data-id="element-8" style="font-size:14.208333333333334px;"><p data-id="element-9" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> Optical Character Recognition (OCR) Once the document is converted into images, the next step involves performing OCR to detect and extract text from the images. The OCR engine is fine-tuned to handle various fonts, layouts, and languages, ensuring maximum text extraction accuracy. OCRPro.ai can handle complex documents, including those with mixed fonts, special characters, and multiple languages, making it ideal for diverse industries and document types.</p></li><li data-id="element-10" style="font-size:14.208333333333334px;"><p data-id="element-11" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> Data Extraction Using Trained Machine Learning Models After the OCR extracts the text, OCRPro.ai processes the data through a machine-learning model, specifically LayoutLMv3. LayoutLMv3 is a cutting-edge model designed for document understanding. It is trained on a custom dataset tailored to the client’s specific needs, allowing the system to identify and extract highly relevant data points from various document types. The model’s ability to understand the layout, structure, and context of the document ensures that it can accurately extract important information, even from complex and unstructured documents. This capability helps streamline data extraction by focusing on the most relevant information, reducing the need for manual intervention. The model’s ability to understand the layout and context of the document allows it to extract information accurately, even from complex and unstructured documents.</p></li><li data-id="element-12" style="font-size:14.208333333333334px;"><p data-id="element-13" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> Data Visualization and Editing After extracting the data, the application visualizes the information on the</p></li></ol>', '<p data-id="element-14" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;">frontend, presenting the user with an interactive interface to review the data. The extracted text, along with its bounding boxes, is displayed, allowing users to make manual corrections if necessary. This feature is ideal for verifying the accuracy of the extracted data and making any adjustments before finalizing the extraction.</p><ol data-id="element-15"><li data-id="element-16" style="font-size:14.208333333333334px;"><p data-id="element-17" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> Downloadable Output Once the data has been reviewed and edited, the user can download the extracted data in JSON format. This output can then be integrated into other business systems or used for further processing. The JSON format ensures that the data remains structured and easy to use, reducing the need for additional manual handling.</p></li><li data-id="element-18" style="font-size:14.208333333333334px;"><p data-id="element-19" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> History Tracking OCRPro.ai is also equipped with a document editing feature that tracks changes made to the extracted data. This feature ensures that the entire document history is captured, providing transparency and accountability for any modifications made. It’s particularly useful for businesses that need to ensure data accuracy and maintain an audit trail.</p></li></ol><p data-id="element-20" style="font-size:16.791666666666668px;font-weight:700;font-style:normal;">Custom Document Training Process</p><p data-id="element-21" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;">OCRPro.ai leverages machine learning to extract highly relevant data from documents. To ensure that the system is optimized for a specific document type, we follow a comprehensive training process that tailors the LayoutLMv3 model to meet the client\'s needs. This process involves several key steps:</p><ol data-id="element-22"><li data-id="element-23" style="font-size:14.208333333333334px;"><p data-id="element-24" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> Document Collection and Dataset Creation The first step is to gather various types of documents that the system will process. We ensure that the dataset contains a diverse set of examples to cover the different layouts, formats, and structures the documents might have. These documents are carefully selected to reflect the real-world variety that OCRPro.ai will encounter. Once collected, these documents form the foundation of the training dataset.</p></li><li data-id="element-25" style="font-size:14.208333333333334px;"><p data-id="element-26" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> Data Annotation with Label Studio After gathering the documents, the next step is to annotate them with relevant labels. We use Label Studio, a powerful tool for data labeling, to manually annotate key data points within the documents. Label Studio allows us to define custom labels that correspond to the data we want to extract, such as names, dates, numbers, and other specific fields. This annotation process ensures that the dataset is compatible with the LayoutLMv3 model’s training format. The labeled dataset is then exported in a format suitable for model training, allowing the machine learning algorithm to learn how to identify and extract the annotated information from new documents.</p></li></ol>', '<ol data-id="element-27"><li data-id="element-28" style="font-size:14.208333333333334px;"><p data-id="element-29" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> Model Training in Google Colab With the dataset ready, we move on to the training phase. We perform the model training in Google Colab, which provides a flexible environment for running machine learning experiments. In this phase, we fine-tune the LayoutLMv3 model, a powerful document understanding model, on the custom dataset. The model learns from the labeled data, improving its ability to recognize and extract relevant information based on the document\'s structure and content.</p></li><li data-id="element-30" style="font-size:14.208333333333334px;"><p data-id="element-31" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> Model Deployment on Hugging Face Once the model is trained and achieves satisfactory accuracy, we push it to Hugging Face, a platform for hosting and sharing machine learning models. This makes the trained model accessible for deployment and integration into OCRPro.ai’s pipeline. Hugging Face provides easy access to the model, enabling us to retrieve and use it in our application code to process new documents efficiently.</p></li><li data-id="element-32" style="font-size:14.208333333333334px;"><p data-id="element-33" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> Integration into OCRPro.ai Finally, the trained model is integrated into OCRPro.ai. The system now uses this model to automatically extract data from documents in real-time. By leveraging the custom-trained LayoutLMv3 model, OCRPro.ai ensures that it can accurately identify and extract the most relevant data for any given document type.</p></li></ol><p data-id="element-34" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;">This custom training process allows OCRPro.ai to provide highly accurate and context-aware data extraction, making it adaptable to a wide range of document types. By following these steps, we ensure that the model is tailored to the specific needs of our clients, providing a powerful tool for document processing that improves over time with additional training and data.</p><p data-id="element-35" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"></p><p data-id="element-36" style="font-size:16.791666666666668px;font-weight:700;font-style:normal;">Benefits of Using OCRPro.ai</p><ul data-id="element-37"><li data-id="element-38" style="font-size:14.208333333333334px;"><p data-id="element-39" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> Efficiency: Automates the data extraction process, reducing the time spent on manual data entry.</p></li><li data-id="element-40" style="font-size:14.208333333333334px;"><p data-id="element-41" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> Accuracy: The combination of OCR and the trained LayoutLMv3 model ensures high-quality and accurate extraction of structured data.</p></li><li data-id="element-42" style="font-size:14.208333333333334px;"><p data-id="element-43" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> Flexibility: Can handle various document types, including invoices, contracts, tenders, and other business documents.</p></li><li data-id="element-44" style="font-size:14.208333333333334px;"><p data-id="element-45" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> Ease of Use: The intuitive interface allows users to easily interact with the extracted data, review it, and make corrections if necessary.</p></li><li data-id="element-46" style="font-size:14.208333333333334px;"><p data-id="element-47" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> Scalability: OCRPro.ai can handle large volumes of documents, making it suitable for businesses of all sizes.</p></li></ul><p data-id="element-48" style="font-size:16.791666666666668px;font-weight:700;font-style:normal;">Use Cases</p>', '<p data-id="element-49" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;">OCRPro.ai can be applied across a wide range of industries, including but not limited to:</p><ul data-id="element-50"><li data-id="element-51" style="font-size:14.208333333333334px;"><p data-id="element-52" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> Finance & Accounting: Automate the extraction of financial data from invoices, receipts, and purchase orders.</p></li><li data-id="element-53" style="font-size:14.208333333333334px;"><p data-id="element-54" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> Legal & Compliance: Extract data from contracts, agreements, and tenders to ensure compliance and simplify contract management.</p></li><li data-id="element-55" style="font-size:14.208333333333334px;"><p data-id="element-56" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> Healthcare: Process medical records, patient information, and insurance claims.</p></li><li data-id="element-57" style="font-size:14.208333333333334px;"><p data-id="element-58" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"> Supply Chain & Logistics: Extract data from shipping documents, inventory records, and order forms.</p></li></ul><p data-id="element-59" style="font-size:16.791666666666668px;font-weight:700;font-style:normal;">Conclusion</p><p data-id="element-60" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;">OCRPro.ai is an innovative solution designed to streamline document processing by extracting valuable data from PDFs and images using OCR and machine learning. It combines the power of advanced technologies with ease of use, providing businesses with a reliable and efficient tool to handle their document data extraction needs. By using OCRPro.ai, businesses can save time, reduce errors, and enhance productivity, allowing them to focus on their core operations while leaving the tedious task of data extraction to the AI-powered platform.</p><p data-id="element-61" style="font-size:14.208333333333334px;font-weight:400;font-style:normal;"></p>']


  // const handleSave = () => {
  //   if (!leftTiptapRef.current || !rightTiptapRef.current) return;

  //   const leftHTML = leftTiptapRef.current.getContent(); // Get left editor content
  //   const rightHTML = rightTiptapRef.current.getContent(); // Get right editor content
  //   const leftEditor = leftTiptapRef.current.editor; 

  //   // console.log("leftHTML", leftHTML);
  //   // console.log("rightHTML", rightHTML);

  //   const parser = new DOMParser();
  //   const rightDoc = parser.parseFromString(rightHTML, "text/html");

  //   const rightElement = rightDoc.querySelector("[data-id]");
  //   if (!rightElement) {
  //     console.log("No element with data-id found in right editor");
  //     return;
  //   }

  //   console.log("rightElement", rightElement);
  //   const dataId = rightElement.getAttribute("data-id"); // Extract dynamic data-id
  //   console.log("Replacing element with data-id:", dataId);

  //   // // Parse left editor content
  //   //   const leftDoc = parser.parseFromString(leftHTML, "text/html");
  //   //   const leftElement = leftDoc.querySelector(`[data-id="${dataId}"]`);

      
  //   //   if (leftElement) {
  //   //     leftElement.innerHTML = rightElement.innerHTML; // Replace only text/content
  //   //   } else {
  //   //     console.log(`No matching element with data-id="${dataId}" found in left editor`);
  //   //     return;
  //   //   }
  //   //   console.log("leftElement", leftElement);
  //   //   const updatedLeftHTML = leftDoc.body.innerHTML;
  //   //   leftTiptapRef.current.setContent(updatedLeftHTML); // Update left editor

  //   //   console.log("Updated Left Editor Content:", updatedLeftHTML);

  //   leftEditor.commands.focus(); // Ensure the editor is active
  // leftEditor.state.doc.descendants((node: { type: { name: string }; attrs: { [x: string]: string | null } }, pos: any) => {
  //   if (node.type.name === "paragraph" && node.attrs["data-id"] === dataId) {
  //     leftEditor.commands.setNodeMarkup(pos, undefined, {
  //       ...node.attrs,
  //       content: rightElement.innerHTML, // Replace only the content inside
  //     });
  //     return false; // Stop iteration
  //   }
  //   return true;
  // });


  // };

  const [prompt, setPrompt] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSave = () => {
    if (!leftTiptapRef.current || !rightTiptapRef.current) return;
  
    const leftEditor = leftTiptapRef.current?.editor;  // Ensure editor instance exists
    const rightEditor = rightTiptapRef.current?.editor;
  
    if (!leftEditor || !rightEditor) {
      console.error("Tiptap editor instance is not available.");
      return;
    }
  
    // Parse right editor content to get the updated content
    const parser = new DOMParser();
    const rightDoc = parser.parseFromString(rightEditor.getHTML(), "text/html");
  
    // Find the first element with a `data-id` (any element type)
    const rightElement = rightDoc.querySelector("[data-id]");
    if (!rightElement) {
      console.log("No element with data-id found in right editor");
      return;
    }

    console.log("rightElement", rightElement);
  
    const dataId = rightElement.getAttribute("data-id"); // Get dynamic data-id
    console.log("Replacing text of element with data-id:", dataId);

    const rightJSON = rightEditor.getJSON();

  // Find the specific node in rightEditor JSON with matching `data-id`
    let newNodeContent: { attrs: { [x: string]: string | null } } | null = null;
    rightJSON.content.forEach((node: { attrs: { [x: string]: string | null } }) => {
      if (node.attrs && node.attrs["data-id"] === dataId) {
        newNodeContent = node;
      }
    });

    console.log("newNodeContent))))))))))" , newNodeContent)

    if (!newNodeContent) {
      console.error("Matching node not found in right editor's JSON.");
      return;
    }

  
    // Ensure Tiptap has focus before modifying content
    leftEditor.commands.focus();
  
    // Find the corresponding element in the left editor using ProseMirror's API
    let found = false;
    leftEditor.state.doc.descendants((node: {
      nodeSize: number
      type: any, attrs: { [x: string]: string | null } 
}, pos: number) => {
      if (node.attrs && node.attrs["data-id"] === dataId) {
        leftEditor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + node.nodeSize }) // Remove old content
        .insertContentAt(pos, newNodeContent)
        .run();
        found = true;
        return false; // Stop iteration once found
      }
      return true;
    });
  
    if (!found) {
      console.log(`No matching element with data-id="${dataId}" found in left editor`);
    }
  };

  const handleSubmit=async(e: { preventDefault: () => void })=>{
    e.preventDefault()
    setLoading(true)
    console.log('submit ----->', prompt)
    const res = await axios.post('http://127.0.0.1:5000/api/model', {prompt , content: page_array.join()})
    console.log(res.data)
    const html = res.data.data.data.split('```')[1].replace('html\n', '')
    // console.log("html ------------------>", html)
    setResult(html)
    setLoading(false)
  }

  useEffect(() => {
    if (rightTiptapRef.current && rightTiptapRef.current.editor) {
      rightTiptapRef.current.editor.commands.setContent(result);
    }
  }, [result]);

  console.log("result ++++++++++++++++" , result)
  
  return (
    <>
    <form onSubmit={handleSubmit} className='flex flex-col gap-4 p-4 justify-center items-center'>
      <Input type="text" placeholder="Search" onChange={(e) => setPrompt(e.target.value)}/>
      <Button variant="secondary" type='submit' className='w-[5rem]'>
      {loading &&  <Loader2 className="animate-spin" />}
        AI Search</Button>

    </form>
    <div className='text-[11px] flex '>



    {/* {page_array.map((item, index) => (
    ))} */}
    <Tiptap content={page_array.join()} ref={leftTiptapRef} editable={true}/>

    {/* <button className='bg-blue-500 h-fit text-white text-2xl p-2 rounded-md' onClick={handleSave}>Save</button> */}

    {/* <Tiptap ref={rightTiptapRef} content={result}/> */}
    {/* <PageEditor/> */}
    </div>
    </>
  )
}

export default page