import React, { useState, useMemo, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CommentOrderTypes,
  CommentProductTypes,
  Comment,
  CommentCategory,
} from "@/types/orders.types";

type CommentSectionProps = {
  comments?: Comment[];
  isProduct?: boolean;
};

export const CommentSectionView = ({
  comments = [],
  isProduct,
}: CommentSectionProps) => {
  const [openAccordionItems, setOpenAccordionItems] = useState<
    CommentCategory[]
  >([]);

  const categories = useMemo(() => {
    return Object.entries(isProduct ? CommentProductTypes : CommentOrderTypes);
  }, [isProduct]);

  const groupedComments = useMemo(() => {
    const grouped = {} as Record<CommentCategory, Comment[]>;

    comments.forEach((comment: Comment) => {
      grouped[comment.type] = [];
    });
    comments.forEach((comment: Comment) => {
      if (grouped[comment.type]) {
        grouped[comment.type].push(comment);
      }
    });
    return grouped;
  }, [comments]);

  const renderComments = (category: CommentCategory) => (
    <div className="space-y-2">
      {groupedComments[category]?.map((comment) => (
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
          {categories.map(([key, val]) => (
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
