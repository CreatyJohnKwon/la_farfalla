"use server";

import { fetchSeason } from '@/src/shared/lib/server/season';
import NavbarClient from './NavbarClient';

// ISR

const NavbarWrapper = async () => {
    const category = await fetchSeason();

    return <NavbarClient category={category} />;
};

export default NavbarWrapper;