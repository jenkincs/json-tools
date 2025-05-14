import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  noindex = false,
  nofollow = false,
}) => {
  const location = useLocation();
  const baseUrl = 'https://jsongeeks.dev'; // 网站基础URL
  const canonicalUrl = `${baseUrl}${location.pathname}`;
  
  return (
    <Helmet>
      {title && <title>{title}</title>}
      {title && <meta property="og:title" content={title} />}
      {title && <meta name="twitter:title" content={title} />}
      
      {description && <meta name="description" content={description} />}
      {description && <meta property="og:description" content={description} />}
      {description && <meta name="twitter:description" content={description} />}
      
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {image && <meta property="og:image" content={image} />}
      {image && <meta name="twitter:image" content={image} />}
      
      {noindex || nofollow ? (
        <meta 
          name="robots" 
          content={`${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`} 
        />
      ) : null}
      
      {/* 规范链接标签 */}
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="twitter:url" content={canonicalUrl} />
    </Helmet>
  );
}; 