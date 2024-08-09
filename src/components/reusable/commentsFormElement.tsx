import React, { useState, useEffect } from "react";
import { Control, UseFormSetValue } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Comment = {
  id: string;
  text: string;
};

type CommentCategory = "general" | "transport" | "warehouse";

type CommentSectionProps = {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  name: string;
};

const predefinedComments: Record<CommentCategory, Comment[]> = {
  general: [
    { id: "general-1", text: "Uwaga zawiera styropian" },
    { id: "general-2", text: "Pocieranie niewskazane" },
  ],
  transport: [{ id: "transport-1", text: "Ostrożnie przy transporcie" }],
  warehouse: [{ id: "warehouse-1", text: "Uwaga, delikatna zawartość" }],
};

export function CommentSection({
  control,
  setValue,
  name,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Record<CommentCategory, Comment[]>>({
    general: [],
    transport: [],
    warehouse: [],
  });
  const [newCommentText, setNewCommentText] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CommentCategory>("general");
  const [openAccordionItems, setOpenAccordionItems] = useState<
    CommentCategory[]
  >([]);

  useEffect(() => {
    const openItems = Object.entries(comments)
      .filter(([_, categoryComments]) => categoryComments.length > 0)
      .map(([category]) => category as CommentCategory);
    setOpenAccordionItems(openItems);
  }, [comments]);

  const addCustomComment = () => {
    if (newCommentText.trim()) {
      const newComment: Comment = {
        id: `custom-${selectedCategory}-${
          comments[selectedCategory].length + 1
        }`,
        text: newCommentText.trim(),
      };
      setComments((prev) => {
        const updatedComments = {
          ...prev,
          [selectedCategory]: [...prev[selectedCategory], newComment],
        };
        updateFormValues(updatedComments);
        return updatedComments;
      });
      setNewCommentText("");
    }
  };

  const addPredefinedComment = (commentId: string) => {
    const commentToAdd = predefinedComments[selectedCategory].find(
      (c) => c.id === commentId
    );
    if (
      commentToAdd &&
      !comments[selectedCategory].some((c) => c.id === commentToAdd.id)
    ) {
      setComments((prev) => {
        const updatedComments = {
          ...prev,
          [selectedCategory]: [...prev[selectedCategory], commentToAdd],
        };
        updateFormValues(updatedComments);
        return updatedComments;
      });
    }
  };

  const updateFormValues = (
    updatedComments: Record<CommentCategory, Comment[]>
  ) => {
    Object.entries(updatedComments).forEach(([category, categoryComments]) => {
      setValue(
        `${name}.${category}`,
        categoryComments.map((comment) => comment.id)
      );
    });
  };

  const renderComments = (category: CommentCategory) => (
    <div className="space-y-2">
      {comments[category].map((comment) => (
        <FormField
          key={comment.id}
          control={control}
          name={`${name}.${category}`}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value?.includes(comment.id)}
                  onCheckedChange={(checked) => {
                    const updatedValue = checked
                      ? [...(field.value || []), comment.id]
                      : field.value?.filter(
                          (value: string) => value !== comment.id
                        );
                    field.onChange(updatedValue);
                  }}
                />
              </FormControl>
              <FormLabel className="font-normal">{comment.text}</FormLabel>
            </FormItem>
          )}
        />
      ))}
    </div>
  );

  return (
    <Card className="w-full">
      <CardContent className="pt-6 space-y-4">
        <Accordion
          type="multiple"
          value={openAccordionItems}
          onValueChange={(value) =>
            setOpenAccordionItems(value as CommentCategory[])
          }
        >
          <AccordionItem value="general">
            <AccordionTrigger>Uwagi ogólne</AccordionTrigger>
            <AccordionContent>{renderComments("general")}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="transport">
            <AccordionTrigger>Uwagi dla transprtu</AccordionTrigger>
            <AccordionContent>{renderComments("transport")}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="warehouse">
            <AccordionTrigger>Uwagi dla magazynu</AccordionTrigger>
            <AccordionContent>{renderComments("warehouse")}</AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="space-y-2">
          <Select
            value={selectedCategory}
            onValueChange={(value: CommentCategory) =>
              setSelectedCategory(value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz kategorię" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">Ogólne</SelectItem>
              <SelectItem value="transport">Dla transportu</SelectItem>
              <SelectItem value="warehouse">Dla magazynu</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={addPredefinedComment}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz predefiniowaną uwagę" />
            </SelectTrigger>
            <SelectContent>
              {predefinedComments[selectedCategory].map((comment) => (
                <SelectItem key={comment.id} value={comment.id}>
                  {comment.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex space-x-2">
            <Input
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Dodaj nową uwagę"
            />
            <Button onClick={addCustomComment}>Dodaj własną uwagę</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
