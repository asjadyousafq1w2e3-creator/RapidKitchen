import { Link } from "react-router-dom";

const footerLinks = {
  Shop: ["All Products", "Best Sellers", "New Arrivals", "Sale"],
  Support: ["Contact Us", "Shipping Info", "Returns", "FAQ"],
  Company: ["About Us", "Blog", "Careers", "Press"],
  Legal: ["Privacy Policy", "Terms of Service", "Refund Policy"],
};

const Footer = () => (
  <footer className="bg-card border-t border-border">
    <div className="container-tight section-padding pb-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="font-display text-2xl text-foreground">
            Chef<span className="text-primary">Ease</span>
          </Link>
          <p className="text-sm text-muted-foreground mt-3 max-w-xs">
            Premium kitchen gadgets for the modern home. Upgrade your cooking experience.
          </p>
        </div>
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="font-display text-sm text-foreground mb-4">{title}</h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground">
          © 2026 ChefEase. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>🇵🇰 Pakistan</span>
          <span>PKR</span>
          <span>English</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
