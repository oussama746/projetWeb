import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";

export interface Company {
  id: string;
  name: string;
  logo?: string;
  sector: string;
  location: string;
  size: string;
  openPositions: number;
  description: string;
}

interface CompanyCardProps {
  company: Company;
}

const CompanyCard = ({ company }: CompanyCardProps) => {
  return (
    <Link
      to={`/entreprises/${company.id}`}
      className="group block bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border hover:border-primary/20"
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Building2 className="w-8 h-8 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {company.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{company.sector}</p>

          <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {company.location}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {company.size}
            </span>
          </div>
        </div>

        {company.openPositions > 0 && (
          <Badge className="gradient-primary text-primary-foreground border-0 flex-shrink-0">
            {company.openPositions} offre{company.openPositions > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
        {company.description}
      </p>
    </Link>
  );
};

export default CompanyCard;
