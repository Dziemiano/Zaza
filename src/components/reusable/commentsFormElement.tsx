import React, { useState, useMemo, useEffect } from "react";
import { Control, UseFormSetValue, useWatch } from "react-hook-form";
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
import { CommentCategory, CommentTypes, Comment } from "@/types/orders.types";

type CommentSectionProps = {
  control?: Control<any>;
  setValue?: UseFormSetValue<any>;
  name: string;
  viewOnly?: boolean;
  comments?: Comment[];
};

const predefinedComments: Record<CommentCategory, string[]> = {
  general: [
    "Uwaga zawiera styropian",
    "Pocieranie niewskazane",
    "Gotówka do odbioru",
  ],
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

export const CommentSection = ({
  control,
  setValue,
  name,
  viewOnly = false,
  comments = [],
}: CommentSectionProps) => {
  const [newCommentBody, setNewCommentBody] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CommentCategory>("general");
  const [lastAddedCategory, setLastAddedCategory] =
    useState<CommentCategory | null>(null);
  const [openAccordionItems, setOpenAccordionItems] = useState<
    CommentCategory[]
  >([]);

  const watchedComments = viewOnly
    ? comments
    : useWatch({
        control,
        name,
        defaultValue: [],
      });

  const groupedComments = useMemo(() => {
    const grouped: Record<CommentCategory, Comment[]> = {
      general: [],
      transport: [],
      warehouse: [],
      production: [],
    };
    watchedComments.forEach((comment: Comment) => {
      if (grouped[comment.type]) {
        grouped[comment.type].push(comment);
      }
    });
    return grouped;
  }, [viewOnly, comments, watchedComments]);

  useEffect(() => {
    if (lastAddedCategory) {
      setSelectedCategory(lastAddedCategory);
      setOpenAccordionItems((prev) =>
        prev.includes(lastAddedCategory) ? prev : [...prev, lastAddedCategory]
      );
      setLastAddedCategory(null);
    }
  }, [lastAddedCategory]);

  const addCustomComment = () => {
    if (!viewOnly && newCommentBody.trim()) {
      const newComment = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: selectedCategory,
        body: newCommentBody.trim(),
      };
      setValue(name, [...watchedComments, newComment]);
      setNewCommentBody("");
      setLastAddedCategory(selectedCategory);
    }
  };

  const addPredefinedComment = (commentBody: string) => {
    if (
      !viewOnly &&
      !watchedComments.some((c: Comment) => c.body === commentBody)
    ) {
      const newComment = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: selectedCategory,
        body: commentBody,
      };
      setValue(name, [...watchedComments, newComment]);
      setLastAddedCategory(selectedCategory);
    }
  };

  const renderComments = (category: CommentCategory) => (
    <div className="space-y-2">
      {groupedComments[category].map((comment) => (
        <div key={comment.id} className="flex items-center space-x-2">
          {!viewOnly && (
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
          )}
          {viewOnly && <span>{comment.body}</span>}
        </div>
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
          {Object.entries(CommentTypes).map(([key, val]) => (
            <AccordionItem value={key}>
              <AccordionTrigger>{val}</AccordionTrigger>
              <AccordionContent>
                {renderComments(key as CommentCategory)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {!viewOnly && (
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
                {Object.entries(CommentTypes).map(([key, val]) => (
                  <SelectItem value={key}>{val}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={addPredefinedComment}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz predefiniowaną uwagę" />
              </SelectTrigger>
              <SelectContent>
                {predefinedComments[selectedCategory].map((comment, index) => (
                  <SelectItem
                    key={`${selectedCategory}-${index}`}
                    value={comment}
                  >
                    {comment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex space-x-2">
              <Input
                value={newCommentBody}
                onChange={(e) => setNewCommentBody(e.target.value)}
                placeholder="Dodaj nową uwagę"
              />
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  addCustomComment();
                }}
              >
                Dodaj własną uwagę
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
