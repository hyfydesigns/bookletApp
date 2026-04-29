import { Progress } from "@/components/ui/progress";
import { calcBookletProgress } from "@/lib/utils";
import { BookOpen, FileImage, Layout } from "lucide-react";

interface BookletProgressProps {
  totalPages: number;
  frontSectionPages: number;
  fullPageAds: number;
  halfPageAds: number;
}

export function BookletProgress({
  totalPages,
  frontSectionPages,
  fullPageAds,
  halfPageAds,
}: BookletProgressProps) {
  const { adPagesAvailable, adPagesUsed, adPagesRemaining, completionPercent } =
    calcBookletProgress(totalPages, frontSectionPages, fullPageAds, halfPageAds);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Booklet Progress</span>
        <span className="text-muted-foreground">{completionPercent}% full</span>
      </div>
      <Progress value={completionPercent} />
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="bg-muted rounded-lg p-2">
          <Layout className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="font-semibold">{frontSectionPages}</p>
          <p className="text-muted-foreground">Front pages</p>
        </div>
        <div className="bg-muted rounded-lg p-2">
          <FileImage className="h-4 w-4 mx-auto mb-1 text-blue-500" />
          <p className="font-semibold">{adPagesUsed}</p>
          <p className="text-muted-foreground">Ad pages used</p>
        </div>
        <div className="bg-muted rounded-lg p-2">
          <BookOpen className="h-4 w-4 mx-auto mb-1 text-green-500" />
          <p className="font-semibold">{adPagesRemaining}</p>
          <p className="text-muted-foreground">Pages left</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {fullPageAds} full-page · {halfPageAds} half-page · {totalPages} total pages
      </p>
    </div>
  );
}
