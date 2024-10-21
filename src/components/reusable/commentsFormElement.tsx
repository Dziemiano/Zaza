import React, { useState, useMemo, useEffect } from "react";
import { useFormContext } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CommentOrderTypes,
  CommentOrderCategory,
  CommentProductCategory,
  CommentProductTypes,
  Comment,
  CommentCategory,
} from "@/types/orders.types";

type CommentSectionProps = {
  name: string;
  isProduct?: boolean;
};

const predefinedOrderComments: Record<CommentOrderCategory, string[]> = {
  general: ["Gotówka do odbioru [kwota]"],
  transport: [
    "Ostrożnie przy transporcie",
    "Towar na solówce",
    "Dzwonić godzinę przed dostawą",
  ],
  warehouse: ["Uwaga, delikatna zawartość", "Bez palet"],
  production: [
    "Bez etykiet",
    "Balotować",
    "Zapakować w białą folię",
    "Zapakować w zieloną folię + etykieta",
    "Bez Palet",
  ],
};

const predefinedProductComments: Record<CommentProductCategory, string[]> = {
  general: [],
};

export const CommentSection = ({ name, isProduct }: CommentSectionProps) => {
  const [commentBody, setCommentBody] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CommentCategory>("general");
  const [lastAddedCategory, setLastAddedCategory] =
    useState<CommentCategory | null>(null);
  const [openAccordionItems, setOpenAccordionItems] = useState<
    CommentCategory[]
  >([]);

  const commentSuggestions:
    | Record<CommentOrderCategory, string[]>
    | Record<CommentProductCategory, string[]> = useMemo(() => {
    return isProduct ? predefinedProductComments : predefinedOrderComments;
  }, [isProduct]);

  const categories = useMemo(() => {
    return Object.entries(isProduct ? CommentProductTypes : CommentOrderTypes);
  }, [isProduct]);

  const { control, setValue, watch } = useFormContext();

  const watchedComments: Comment[] = watch(name, []);

  const groupedComments = useMemo(() => {
    const grouped = {} as Record<CommentCategory, Comment[]>;

    Object.keys(commentSuggestions).forEach((key: string) => {
      grouped[key as CommentCategory] = [];
    });
    watchedComments.forEach((comment: Comment) => {
      if (grouped[comment.type]) {
        grouped[comment.type].push(comment);
      }
    });
    return grouped;
  }, [watchedComments]);

  useEffect(() => {
    if (lastAddedCategory) {
      setSelectedCategory(lastAddedCategory);
      setOpenAccordionItems((prev) =>
        prev.includes(lastAddedCategory) ? prev : [...prev, lastAddedCategory]
      );
      setLastAddedCategory(null);
    }
  }, [lastAddedCategory]);

  const saveComment = () => {
    if (
      commentBody.trim() &&
      !watchedComments.some(
        (c: Comment) => c.body === commentBody && c.type === selectedCategory
      )
    ) {
      const newComment = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: selectedCategory,
        body: commentBody.trim(),
      };
      setValue(name, [...watchedComments, newComment]);
      setCommentBody("");
      setLastAddedCategory(selectedCategory);
    }
  };

  const renderComments = (category: CommentCategory) => (
    <div className="space-y-2">
      {groupedComments[category]?.map((comment) => (
        <div key={comment.id} className="flex items-center space-x-2">
          <FormField
            control={control}
            name={`${name}.${comment.id}`}
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={true}
                    onCheckedChange={(checked) => {
                      if (!checked) {
                        setValue(
                          name,
                          watchedComments.filter(
                            (c: Comment) => c.id !== comment.id
                          )
                        );
                      }
                    }}
                  />
                </FormControl>
                <FormLabel className="font-normal">{comment.body}</FormLabel>
              </FormItem>
            )}
          />
        </div>
      ))}
    </div>
  );

  return (
    <Card className="w-full">
      <CardContent className="pt-6 space-y-4 flex flex-row gap-1 justify-between">
        <Accordion
          type="multiple"
          value={openAccordionItems}
          onValueChange={(value) =>
            setOpenAccordionItems(value as CommentCategory[])
          }
          className="basis-2/5"
        >
          {categories.map(([key, val]) => (
            <AccordionItem value={key}>
              <AccordionTrigger>{val}</AccordionTrigger>
              <AccordionContent>
                {renderComments(key as CommentCategory)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="space-y-2 basis-1/2 flex flex-wrap">
          <div className="basis-1/2 pr-1">
            <label>Rodzaj uwagi *</label>
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
                {categories.map(([key, val]) => (
                  <SelectItem value={key}>{val}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="basis-1/2" style={{ marginTop: 0 }}>
            <label>Gotowe uwagi</label>
            <Select onValueChange={(text: string) => setCommentBody(text)}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz predefiniowaną uwagę" />
              </SelectTrigger>
              <SelectContent>
                {/* @ts-ignore */}
                {commentSuggestions[selectedCategory].map((comment, index) => (
                  <SelectItem
                    key={`${selectedCategory}-${index}`}
                    value={comment}
                  >
                    {comment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="Dodaj nową uwagę"
            className="w-full"
          />
          <Button
            onClick={(e) => {
              e.preventDefault();
              saveComment();
            }}
          >
            Dodaj uwagę
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
