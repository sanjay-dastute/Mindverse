import React, { memo } from 'react';
import { CheckCircleFilled } from '@ant-design/icons';
import "./tagCard.css";

const TagProduct = memo(({ img, name, id, selectProduct, taggingInfo }) => {
  return (
    <div className='tag-product' onClick={() => selectProduct(id)} style={taggingInfo.productId === id ? { border: "3px solid #FFC500" } : {}}>
      {
        <CheckCircleFilled className={taggingInfo.productId === id ? 'tag-product-icon text-primary' : 'tag-product-icon text-gray'} />
      }
      <img src={img ? img : "https://ninja-application.s3.ap-southeast-2.amazonaws.com/1723153121006.png"} alt='' className='tag-product-img' />
      <p className='tag-product-name'>{name}</p>
    </div>
  )
})

export default TagProduct;