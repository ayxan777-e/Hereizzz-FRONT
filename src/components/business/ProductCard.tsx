import { Link } from "react-router-dom";
import Badge from "../ui/Badge";
import Card from "../ui/Card";

interface ProductCardProps {
  id: number;
  title: string;
  price: number;
  currency: string;
  marketplace: string;
  category: string;
  imageUrl?: string | null;
}

export default function ProductCard({
  id,
  title,
  price,
  currency,
  marketplace,
  category,
  imageUrl
}: ProductCardProps) {
  return (
    <Link to={`/products/${id}`} className="block h-full">
      <Card className="group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/[0.07]">
        <div className="h-44 w-full overflow-hidden bg-white/10">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-white/40">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <Badge type="info">{marketplace}</Badge>
            <span className="text-xs text-white/45">{category}</span>
          </div>

          <h3 className="line-clamp-2 text-base font-semibold leading-6 text-white">
            {title}
          </h3>

          <div className="mt-auto pt-5">
            <p className="text-lg font-bold text-emerald-300">
              {price} {currency}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}