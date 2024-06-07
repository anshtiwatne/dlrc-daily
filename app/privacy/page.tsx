'use client'

import { Accordion, AccordionItem, Link } from '@nextui-org/react'
import { useState, useEffect } from 'react'
import NextLink from 'next/link'

import { Loader } from '@/components/loader'

export default function Page() {
	const [mounted, setMounted] = useState(false)

	useEffect(() => setMounted(true), [])

	if (!mounted) return <Loader />

	return (
		<div className="w-full px-4 py-2">
			<Accordion defaultExpandedKeys={['1']}>
				<AccordionItem key="1" title="Introduction">
					DLRC built the DLRC Daily app as an Open Source app. This
					SERVICE is provided by DLRC at no cost and is intended for
					use as is. This page is used to inform visitors regarding
					our policies with the collection, use, and disclosure of
					Personal Information if anyone decided to use our Service.
					If you choose to use our Service, then you agree to the
					collection and use of information in relation to this
					policy. The Personal Information that we collect is used for
					providing and improving the Service. We will not use or
					share your information with anyone except as described in
					this Privacy Policy.
				</AccordionItem>
				<AccordionItem key="2" title="Information Collection and Use">
					For a better experience, while using our Service, we may
					require you to provide us with certain personally
					identifiable information, including but not limited to
					approximate location. The information that we request will
					be retained by us and used as described in this privacy
					policy. The app uses third-party services that may collect
					information used to identify you.
					<br />
					Link to the privacy policy of third-party service providers
					used by the app:
					<ul className="list-inside list-disc py-2">
						<li>
							<Link
								isExternal
								as={NextLink}
								href="https://www.google.com/policies/privacy/"
							>
								Google Play Services
							</Link>
						</li>
						<li>
							<Link
								isExternal
								as={NextLink}
								href="https://marketingplatform.google.com/about/analytics/terms/us/"
							>
								Google Analytics
							</Link>
						</li>
					</ul>
				</AccordionItem>
				<AccordionItem key="3" title="Log Data">
					We want to inform you that whenever you use our Service, in
					a case of an error in the app we collect data and
					information (through third-party products) on your phone
					called Log Data. This Log Data may include information such
					as your device Internet Protocol (“IP”) address, device
					name, operating system version, the configuration of the app
					when utilizing our Service, the time and date of your use of
					the Service, and other statistics.
				</AccordionItem>
				<AccordionItem key="4" title="Cookies">
					Cookies are files with a small amount of data that are
					commonly used as anonymous unique identifiers. These are
					sent to your browser from the websites that you visit and
					are stored on your device&apos;s internal memory. While
					cookies are not use by this service, the app may use
					third-party code and libraries that use “cookies” to collect
					information and improve their services. You have the option
					to either accept or refuse these cookies and know when a
					cookie is being sent to your device. If you choose to refuse
					our cookies, you may not be able to use some portions of
					this Service.
				</AccordionItem>
				<AccordionItem key="5" title="Service Providers">
					We may employ third-party companies and individuals due to
					the following reasons:
					<ul className="list-inside list-disc py-2">
						<li>To facilitate our Service</li>
						<li>To provide the Service on our behalf</li>
						<li>To perform Service-related services</li>
						<li>
							To assist us in analyzing how our Service is used
						</li>
					</ul>
					We want to inform users of this Service that these third
					parties have access to their Personal Information. The
					reason is to perform the tasks assigned to them on our
					behalf. However, they are obligated not to disclose or use
					the information for any other purpose.
				</AccordionItem>
				<AccordionItem key="6" title="Security">
					We value your trust in providing us your Personal
					Information, thus we are striving to use commercially
					acceptable means of protecting it. But remember that no
					method of transmission over the internet, or method of
					electronic storage is 100% secure and reliable, and we
					cannot guarantee its absolute security.
				</AccordionItem>
				<AccordionItem key="7" title="Links to Other Sites">
					This Service may contain links to other sites. If you click
					on a third-party link, you will be directed to that site.
					Note that these external sites are not operated by us.
					Therefore, we strongly advise you to review the Privacy
					Policy of these websites. We have no control over and assume
					no responsibility for the content, privacy policies, or
					practices of any third-party sites or services.
				</AccordionItem>
				<AccordionItem key="8" title="Children's Privacy">
					These Services do not address anyone under the age of 13. We
					do not knowingly collect personally identifiable information
					from children under 13 years of age. In the case we discover
					that a child under 13 has provided us with personal
					information, we immediately delete this from our servers. If
					you are a parent or guardian and you are aware that your
					child has provided us with personal information, please
					contact us so that we will be able to do the necessary
					actions.
				</AccordionItem>
				<AccordionItem key="9" title="Changes to This Privacy Policy">
					We may update our Privacy Policy from time to time. Thus,
					you are advised to review this page periodically for any
					changes. We will notify you of any changes by posting the
					new Privacy Policy on this page.
					<br />
					This policy is effective as of 2023-07-28
				</AccordionItem>
				<AccordionItem key="10" title="Contact Us">
					If you have any questions or suggestions about our Privacy
					Policy, do not hesitate to contact us at{' '}
					<Link isExternal as={NextLink} href="dev@dlrc.in">
						dev@dlrc.in
					</Link>
				</AccordionItem>
			</Accordion>
		</div>
	)
}
