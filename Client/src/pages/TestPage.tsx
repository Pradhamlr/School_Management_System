import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-green-600">
            ✅ New Routes Working!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg mb-4">If you can see this page, the new routes are working correctly.</p>
          <div className="space-y-2">
            <p><strong>Test Route:</strong> /test-page</p>
            <p><strong>Next:</strong> Try /student-dashboard-new</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestPage;