import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Category {
  name: string;
  score: string;
  youHave: string[];
  youNeed: string[];
}

interface Recommendations {
  profileBuilding?: string;
  petitionerServices?: string;
  timeline?: string;
  nextSteps?: string[];
}

interface StructuredOverviewData {
  evaluationSummary: string;
  categories: Category[];
  recommendations: Recommendations;
}

interface StructuredOverviewProps {
  overview: StructuredOverviewData;
}

export const StructuredOverview = ({ overview }: StructuredOverviewProps) => {
  return (
    <div className="space-y-6">
      {/* Evaluation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evaluation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{overview.evaluationSummary}</p>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Category Breakdown</h3>
        {overview.categories.map((category, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{category.name}</CardTitle>
                <Badge variant="secondary">{category.score}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.youHave.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-green-600 mb-2">✓ What You Have:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {category.youHave.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {category.youNeed.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-orange-600 mb-2">→ What You Need:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {category.youNeed.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {overview.recommendations.profileBuilding && (
            <div>
              <h4 className="font-medium text-sm mb-2">Profile Building:</h4>
              <p className="text-sm text-muted-foreground">{overview.recommendations.profileBuilding}</p>
            </div>
          )}
          
          {overview.recommendations.petitionerServices && (
            <div>
              <h4 className="font-medium text-sm mb-2">Petitioner Services:</h4>
              <p className="text-sm text-muted-foreground">{overview.recommendations.petitionerServices}</p>
            </div>
          )}

          {overview.recommendations.timeline && (
            <div>
              <h4 className="font-medium text-sm mb-2">Timeline:</h4>
              <p className="text-sm text-muted-foreground">{overview.recommendations.timeline}</p>
            </div>
          )}

          {overview.recommendations.nextSteps && overview.recommendations.nextSteps.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Next Steps:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {overview.recommendations.nextSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};