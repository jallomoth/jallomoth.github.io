// Commissions page
import './Commissions.css';
import Logo from "../components/Logo";
import BackButton from "../components/buttons/BackButton";
import usePageTitle from "../hooks/usePageTitle";
import useJalloseumImages from "../components/gallery/useJalloseumImages";
import GalleryItem from "../components/gallery/GalleryItem";
import useImageModal from "../hooks/useImageModal";
import ImageModal from "../components/ImageModal";

export default function Commissions() {
  usePageTitle("Jallomoth — Commissions");

  const commissionImages = useJalloseumImages("Commissions");
  const modal = useImageModal(commissionImages);

  return (
    <>
      <Logo className="subpage-logo" top="2rem" left="50%" width="clamp(18vw, 35vw, 35rem)" center={true} />
      <BackButton />

      <div className="commissions-top-shield" aria-hidden="true" />
      <div className="commissions-scroll">
        <main className="commissions-content">

          <section className="commissions-questions">
            <p>Q : Do you have an idea you want to be brought into the world ?</p>
            <p>Q : Are you a fan of Jallomoth's artstyle and wanna see yourself or a character you love in it ?</p>
            <p>Q : Do you have a character of your own that you'd like to see Jallo-fied ?</p>
            <p className="commissions-answer">
              A : If you answered yes to any of these questions , you're in luck as Jallomoth's Commissions are OPEN !!!
            </p>
          </section>

          <section className="commissions-brass-tacks">
            <h2 className="commissions-brass-tacks-heading">The Brass Tacks</h2>
            {/* <hr className="commissions-brass-tacks-divider" /> */}

            <p>All payment is up front , either through PayPal or Cashapp .</p>
            <p>In terms of pricing , Jallo usually operates on a <span className="money">$</span>10 an hour basis .</p>
            <p>If he thinks your commission will take an hour , it will be <span className="money">$</span>10 . If he thinks it'll take him 10 hours? <span className="money">$</span>100 .</p>
            <p>There are of course exceptions to all things in life but this is a pretty safe bet as to how he operates most of the time .</p>
            <p>His intuitions are mostly correct , but some pieces can find themselves being surprisingly easy or difficult .</p>
            <p>Wanna know how much your idea will cost ? Reach out to him through discord , email , instagram , or even patreon which can all be found <a href="/community">here</a> .</p>
            <p>To see the full breadth of his artwork as a reference , you can see works of all kinds <a href="/jalloseum">here</a> .</p>
            <p>To see specifically the happy customers who have commissioned him recently , look no further than right below !</p>
          </section>

          <hr className="commissions-gallery-divider" />

          <div className="commissions-gallery">
            {commissionImages.map((img, i) => (
              <GalleryItem
                key={img.path}
                img={img}
                index={i}
                itemRef={(el) => (modal.itemRefs.current[i] = el)}
                showTitle={false}
                onClick={() => modal.handleThumbClick(img, i)}
                isSelected={modal.selectedIndex === i}
                isModalOpen={modal.isModalOpen}
                isModalClosing={modal.isModalClosing}
              />
            ))}
          </div>

        </main>
      </div>

      <ImageModal {...modal} />
    </>
  );
}
