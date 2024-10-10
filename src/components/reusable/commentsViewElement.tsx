import React, { useState, useMemo, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CommentCategory, CommentTypes, Comment } from "@/types/orders.types";

type CommentSectionProps = {
  comments?: Comment[];
};

export const CommentSectionView = ({ comments = [] }: CommentSectionProps) => {
  const [openAccordionItems, setOpenAccordionItems] = useState<
    CommentCategory[]
  >([]);

  const groupedComments = useMemo(() => {
    const grouped: Record<CommentCategory, Comment[]> = {
      general: [],
      transport: [],
      warehouse: [],
      production: [],
    };
    comments.forEach((comment: Comment) => {
      if (grouped[comment.type]) {
        grouped[comment.type].push(comment);
      }
    });
    return grouped;
  }, [comments]);

  const renderComments = (category: CommentCategory) => (
    <div className="space-y-2">
      {groupedComments[category].map((comment) => (
        <div key={comment.id} className="flex items-center space-x-2">
          <span>{comment.body}</span>
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
      </CardContent>
    </Card>
  );
};
