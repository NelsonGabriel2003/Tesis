const SIZES = {
  sm: { img: 'h-8 w-8', text: 'text-lg' },
  md: { img: 'h-10 w-10', text: 'text-xl' },
  lg: { img: 'h-14 w-14', text: 'text-2xl' }
}

const Logo = ({ variant = 'full', size = 'md', imgSize, className = '' }) => {
  const sizeConfig = SIZES[size] || SIZES.md
  const imgClass = imgSize || sizeConfig.img

  if (variant === 'icon') {
    return (
      <div className={`${imgClass} ${className}`}>
        <img
          src="/images/Logo.png"
          alt="Bounty Bar"
          className="w-full h-full"
        />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-[18px] ${className}`}>
      <img
        src="/images/Logo.png"
        alt="Bounty Bar"
        className={`${imgClass} object-contain`}
      />
      <h2 className={`${sizeConfig.text} font-bold text-text-primary`}>
        Bounty Bar
      </h2>
    </div>
  )
}

export default Logo
