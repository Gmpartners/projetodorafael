import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart4Icon, ShoppingBagIcon } from 'lucide-react';

const SalesMetrics = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de Vendas</CardTitle>
        <CardDescription>Resumo de pedidos e faturamento</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Vendas</p>
                  <p className="text-2xl font-bold">R$ 12.450,90</p>
                </div>
                <div className="rounded-full p-2 bg-green-100">
                  <BarChart4Icon className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">Meta mensal</p>
                  <p className="text-xs font-medium">65%</p>
                </div>
                <Progress value={65} className="h-2" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Média por Pedido</p>
                  <p className="text-2xl font-bold">R$ 150,90</p>
                </div>
                <div className="rounded-full p-2 bg-purple-100">
                  <ShoppingBagIcon className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">Crescimento</p>
                  <p className="text-xs font-medium text-green-500">+12.5%</p>
                </div>
                <div className="w-full h-10 flex items-center justify-center bg-zinc-50 rounded-md">
                  <span className="text-xs text-muted-foreground">Gráfico de crescimento</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesMetrics;