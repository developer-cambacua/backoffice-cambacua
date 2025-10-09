import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Toast } from "@/components/toast/Toast";

export const useUploadDocument = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documentacion", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.fileName;
    },
    onError: (fileError) => {
      toast.custom(
        (id) => (
          <Toast id={id} variant="error">
            <div>
              <p>{`Ha ocurrido un error subiendo el archivo:, ${fileError.message}`}</p>
            </div>
          </Toast>
        ),
        { duration: 5000 }
      );
    },
  });
};
