import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export interface Internship {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  duration: string;
  type: string;
  salary?: string;
  postedAt: string;
  tags: string[];
  featured?: boolean;
}

interface InternshipCardProps {
  internship: Internship;
}

const InternshipCard = ({ internship }: InternshipCardProps) => {
  return (
    <article
      className={`group relative bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border hover:border-primary/20 ${
        internship.featured ? "ring-2 ring-primary/20" : ""
      }`}
    >
      {internship.featured && (
        <div className="absolute -top-3 left-6">
          <Badge className="gradient-primary text-primary-foreground border-0">
            En vedette
          </Badge>
        </div>
      )}

      <div className="flex gap-4">
        {/* Company Logo */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
            {internship.companyLogo ? (
              <img
                src={internship.companyLogo}
                alt={internship.company}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {internship.title}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {internship.company}
              </p>
            </div>
            {internship.salary && (
              <Badge variant="secondary" className="flex-shrink-0">
                {internship.salary}
              </Badge>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {internship.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {internship.duration}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {internship.postedAt}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {internship.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs font-medium"
              >
                {tag}
              </Badge>
            ))}
            {internship.tags.length > 3 && (
              <Badge variant="outline" className="text-xs font-medium">
                +{internship.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-5 pt-5 border-t border-border">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link to={`/offres/${internship.id}`}>Voir détails</Link>
        </Button>
        <Button variant="default" size="sm" className="flex-1">
          Postuler
        </Button>
      </div>
    </article>
  );
};

export default InternshipCard;
