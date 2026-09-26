type BrandProps = {
  href: string;
};

export const Brand = ({ href }: BrandProps) => (
  <a
    href={href}
    className="brand-lockup"
    aria-label="Daymark 首页"
  >
    <span className="brand-mark" aria-hidden="true">
      d<span>.</span>
    </span>
    <span className="brand-word">daymark</span>
  </a>
);
