import React, { memo, useState } from 'react'
import { CheckCircleFilled, BarChartOutlined } from "@ant-design/icons";
import TagIconGreen from '../../assets/taggedN.svg';
import TagIconRed from '../../assets/untagged.svg';
import "./tagCard.css";
import { Button } from 'antd';
import PostInsights from '../user/PostInsights';



const TagCard = memo(({ id, img, title, handleTagMedia, selected, onSelect, tagProductId }) => {

  const [visible, setVisible] = useState(false);
  // const containerStyle = {
  // backgroundImage: `url(${tagProductId?TagGreen:TagRed})`,
  // backgroundImage: `url(${tagProductId?TagIconGreen:TagIcon})`,
  // backgroundColor: `${tagProductId?"green":"red"}`,
  // width: 0,
  // height: 0,
  // borderTop: "50px solid transparent",
  // borderBottom: "50px solid transparent",
  // borderRight: "100px solid green",
  // `${tagProductId?"background: linear-gradient(to bottom right, green 50% , transparent 50%)":"background: linear-gradient(to bottom right, red 50% , transparent 50%)"}`
  // background: "linear-gradient(to bottom right, green 50% , transparent 50%)"
  // };

  // const tagStyle = tagProductId ? { background: "linear-gradient(to bottom right, green 50% , transparent 50%)", borderRadius: "6px" } : { background: "linear-gradient(to bottom right, red 50% , transparent 50%)", borderRadius: '6px' };
  const tagStyle = tagProductId ? { backgroundImage: `url(${TagIconGreen})` } : { backgroundImage: `url(${TagIconRed})` };

  let select = selected.includes(id);

  const handleCloseModal = () => {
    setVisible(false);
  };

  return (
    <div className={select ? 'tag-card tag-selected border-primary' : 'tag-card tag-selected border-gray'} onClick={() => onSelect(id)} >
      <div className='tag-icon' style={tagStyle} onClick={(e) => handleTagMedia(id)}>
        {/* <p className='tag-text' >{tagProductId ? "" : "TAG"}</p> */}
      </div>
      <CheckCircleFilled className={select ? "text-primary product-select-icon" : "text-gray product-select-icon"} />
      <img style={{ borderRadius: '9px' }} src={img} alt={title} />
      {tagProductId && <Button className='insights-btn' size='large' shape='circle' icon={<BarChartOutlined />} type="primary" onClick={(e) => {
        e.stopPropagation();
        setVisible(true);
      }} />}
      {visible && <PostInsights postId={id} onClose={handleCloseModal} visible={visible} productId={tagProductId} />}
    </div>
  )
});

export default TagCard;
